use Croma

defmodule ProcessWars.EnemyFactory do
  alias ProcessWars.EnemyUtil

  def create("simple_one_for_one") do
    {:ok, pid} = ProcessWars.SimpleOneForOneEnemy.start_link()
    IO.inspect(["EnemyFactory.create", Process.info(pid)])
    Process.unlink(pid)
  end

  def reset do
    IO.inspect(["EnemyFactory.reset"])
    pids = Process.list
    enemy_pids = pids |> Enum.filter(fn pid -> EnemyUtil.is_enemy(pid) end)
    enemy_child_pids = pids |> Enum.filter(fn pid -> EnemyUtil.is_enemy_child(pid) end)
    Enum.each(enemy_pids, fn pid -> delete(pid) end)
    Enum.each(enemy_child_pids, fn pid -> delete(pid) end)
  end

  defun delete(pid :: v[pid]) :: boolean do
    IO.inspect(["EnemyFactory.delete", Process.info(pid)])
    Process.exit(pid, :kill)
  end
end
