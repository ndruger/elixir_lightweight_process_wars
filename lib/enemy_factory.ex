defmodule ProcessWars.EnemyFactory do
  alias ProcessWars.{EnemyUtil, EnemyMonitor, EnemySimpleOneForOne, EnemyOneForAll, EnemySpawn}
  require Logger

  def create("spawn") do
    pid = EnemySpawn.start()
    Logger.debug("EnemyFactory.create: spawn: #{Process.info(pid) |> inspect}")
  end

  def create("simple_one_for_one") do
    {:ok, pid} = EnemySimpleOneForOne.start_link()
    Logger.debug("EnemyFactory.create: simple_one_for_one: #{Process.info(pid) |> inspect}")
    Process.unlink(pid)
  end

  def create("one_for_all") do
    {:ok, pid} = EnemyOneForAll.start_link()
    Logger.debug("EnemyFactory.create: one_for_all: #{Process.info(pid) |> inspect}")
    Process.unlink(pid)
  end

  def reset do
    Logger.debug("EnemyFactory.reset")
    pids = Process.list
    enemy_pids = pids |> Enum.filter(fn pid -> EnemyUtil.is_enemy(pid) end)
    enemy_child_pids = pids |> Enum.filter(fn pid -> EnemyUtil.is_enemy_child(pid) end)
    Enum.each(enemy_pids, fn pid -> delete(pid) end)
    Enum.each(enemy_child_pids, fn pid -> delete(pid) end)
  end

  def delete(pid) do
    Logger.debug("EnemyFactory.delete: #{Process.info(pid) |> inspect}")
    Process.exit(pid, :kill)
    send(EnemyMonitor, :publish)
  end
end
