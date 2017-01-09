defmodule ProcessWars.RoomChannel do
  use Phoenix.Channel
  alias ProcessWars.Pid
  alias ProcessWars.EnemyFactory

  # command
  # reset
  # create_enemy
  # kill_enemy

  def join("room:game", _auth_msg, socket) do
    {:ok, socket}
  end

  def handle_in("kill", %{"pid" => pid_str}, socket) do
    pid = Pid.from_str(pid_str)
    EnemyFactory.delete(pid)
    {:noreply, socket}
  end

  def handle_in("create_enemy", %{"type" => type}, socket) do
    IO.inspect(["create_enemy", type])
    EnemyFactory.create(type)
    {:noreply, socket}
  end

  def handle_in("reset", %{}, socket) do
    IO.inspect(["reset"])
    EnemyFactory.reset()
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast! socket, "new_msg", %{body: body}
    # pid_list = Process.list |> Enum.map(fn pid -> :erlang.pid_to_list(pid) |> to_string end)
    # broadcast! socket, "new_msg", %{body: pid_list}
    {:noreply, socket}
  end

  # def handle_out("new_msg", payload, socket) do
  #   push socket, "new_msg", payload
  #   {:noreply, socket}
  # end
end