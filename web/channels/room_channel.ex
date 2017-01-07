defmodule ProcessWars.RoomChannel do
  use Phoenix.Channel

  def join("room:game", auth_msg, socket) do
    {:ok, socket}
  end
  def join("room:" <> _private_room_id, _auth_msg, socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("kill", %{"body" => pid_str}, socket) do
    pid = pid_str |> String.to_charlist |> :erlang.list_to_pid
    IO.inspect(Process.info(pid))
    Process.exit(pid, :kill)
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast! socket, "new_msg", %{body: body}
    # pid_list = Process.list |> Enum.map(fn pid -> :erlang.pid_to_list(pid) |> to_string end)
    # broadcast! socket, "new_msg", %{body: pid_list}
    {:noreply, socket}
  end

  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end
end