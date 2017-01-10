defmodule ProcessWars.EnemyMonitor do
  use GenServer
  alias ProcessWars.Pid

  def start_link do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def init(state) do
    schedule()
    {:ok, state}
  end

  def handle_info(:publish, state) do
    schedule()
    pid_entity_list = Process.list |> Enum.map(fn pid -> Pid.to_entity(pid) end)
    ProcessWars.Endpoint.broadcast("room:game", "processes", %{
      "processes" => pid_entity_list,
      "atomMemory" => :erlang.memory(:atom),  # How to get current size of index entries in atom_tab?
    })
    {:noreply, state}
  end

  defp schedule() do
    Process.send_after(self(), :publish, 1 * 1000)
  end
end
