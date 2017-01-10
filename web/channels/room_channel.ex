defmodule ProcessWars.RoomChannel do
  use Phoenix.Channel
  alias ProcessWars.{Pid, EnemyFactory}
  require Logger

  def join("room:game", _auth_msg, socket) do
    Logger.debug("RoomChannel.join")
    {:ok, socket}
  end

  def handle_in("kill", %{"pid" => pid_str}, socket) do
    Logger.debug("RoomChannel: kill: #{pid_str}")
    pid = Pid.from_str(pid_str)
    EnemyFactory.delete(pid)
    {:noreply, socket}
  end

  def handle_in("create_enemy", %{"type" => type}, socket) do
    Logger.debug("RoomChannel: create_enemy: #{type}")
    EnemyFactory.create(type)
    {:noreply, socket}
  end

  def handle_in("reset", %{}, socket) do
    Logger.debug("RoomChannel: reset")
    EnemyFactory.reset()
    {:noreply, socket}
  end
end