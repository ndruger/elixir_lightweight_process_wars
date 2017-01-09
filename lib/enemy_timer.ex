# Dirty GenServer. I don't want to create gen_server per enemy for visual reason of GAME.
defmodule ProcessWars.EnemyTimer do
  use GenServer

  def start_link() do
    GenServer.start_link(__MODULE__, %{subscribers: []}, name: __MODULE__)
  end

  def init(state) do
    # process_flag(trap_exit, true).
    Process.flag(:trap_exit, true)
    schedule()
    {:ok, state}
  end

  def handle_info(:publish, state) do
    Enum.map(state.subscribers, fn {module, method_name, args} ->
      apply(module, method_name, args)
    end)
    schedule
    {:noreply, state}
  end

  def handle_call({:register, {module, method_name, args}}, _, state) do
    subscribers = [{module, method_name, args} | state.subscribers]
    {:reply, subscribers, %{state | subscribers: subscribers}}
  end

  defp schedule do
    Process.send_after(self(), :publish, 5 * 1000)
  end

  def register({module, method_name, args}) do
    GenServer.call(__MODULE__, {:register, {module, method_name, args}})
  end
end
