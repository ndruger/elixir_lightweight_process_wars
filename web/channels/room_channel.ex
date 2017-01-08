defmodule ProcessWars.EnemyChild do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, [], name: name)
  end

  def init(state) do
    {:ok, state}
  end
end

# Dirty GenServer. I don't want to create gen_server per enemy for visual reason of GAME.
defmodule ProcessWars.EnemyTimer do
  use GenServer

  def start_link() do
    GenServer.start_link(__MODULE__, %{subscribers: []}, name: __MODULE__)
  end

  def init(state) do
    schedule()
    {:ok, state}
  end

  def handle_info(:publish, state) do
    Enum.map(state.subscribers, fn {module, method_name, args} ->
      try do
        apply(module, method_name, args)
      rescue
        e -> IO.inspect(e)
      end
    end)
    schedule
    {:noreply, state}
  end

  def handle_call({:register, {module, method_name, args}}, _, state) do
    subscribers = [{module, method_name, args} | state.subscribers]
    {:reply, subscribers, %{state | subscribers: subscribers}}
  end

  defp schedule() do
    Process.send_after(self(), :publish, 5 * 1000)
  end

  def register({module, method_name, args}) do
    GenServer.call(__MODULE__, {:register, {module, method_name, args}})
  end
end

defmodule ProcessWars.EnemyFactory do
  def create(:simple_one_for_one) do
  end
end

# ProcessWars.EnemyTimer.start_link()
# {:ok, pid} = ProcessWars.OneForOneEnemy.start_link()
# Supervisor.which_children(pid)
# {_, c_pid, _, _} = Supervisor.which_children(pid) |> Enum.at(0)
# Process.info(c_pid)
# Process.exit(c_pid, :kill)

defmodule ProcessWars.EnemyUtil do
  def build_name(type) do
    ran = UUID.uuid4() |> String.split("-") |> List.last
    "enemy_#{type}_#{ran}" |> String.to_atom
  end
end

defmodule ProcessWars.OneForOneEnemy do
  use Supervisor

  alias ProcessWars.EnemyChild
  alias ProcessWars.EnemyUtil

  def start_link do
    name = EnemyUtil.build_name("simpleOneForOne")
    Supervisor.start_link(__MODULE__, [name], name: name)
  end

  def create_child(self_pid) do
    name = EnemyUtil.build_name("simpleOneForOneChild")
    Supervisor.start_child(self_pid, [name])
  end

  def init(_args) do
    ProcessWars.EnemyTimer.register({__MODULE__, :create_child, [self()]})

    children = [
      worker(EnemyChild, [], restart: :permanent)
    ]
    options = [
      # strategy: :simple_one_for_one
      strategy: :simple_one_for_one
    ]
    supervise(children, options)
  end
end

defmodule ProcessWars.Pid do
  def pid_to_string(pid) when is_pid(pid) do
    pid |> :erlang.pid_to_list |> to_string
  end

  def pid_to_string(port) when is_port(port) do
    port |> :erlang.port_to_list |> to_string
  end

  def to_entity(pid) when is_pid(pid) do
    %{
      id: pid_to_string(pid),
      name: name(pid),
      links: links(pid) |> Enum.map(&pid_to_string/1),
    }
  end

  def name(pid) when is_pid(pid) do
    case Process.info(pid, :registered_name) do
      {:registered_name, name} -> name
      _ -> ""
    end
  end

  def from_str(pid_str) do
    pid_str |> String.to_charlist |> :erlang.list_to_pid
  end

  def links(pid) when is_pid(pid) do
    case Process.info(pid, :links) do
      {:links, links} -> links
      _ -> []
    end
  end
end

defmodule ProcessWars.EnemyMonitor do
  use GenServer
  alias ProcessWars.Pid

  def start_link() do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def init(state) do
    schedule()
    {:ok, state}
  end

  def handle_info(:publish, state) do
    schedule()
    pid_entity_list = Process.list |> Enum.map(fn pid -> Pid.to_entity(pid) end)
    ProcessWars.Endpoint.broadcast("room:game", "processes", %{processes: pid_entity_list})
    {:noreply, state}
  end

  defp schedule() do
    Process.send_after(self(), :publish, 3 * 1000)
  end
end

defmodule ProcessWars.RoomChannel do
  use Phoenix.Channel
  alias ProcessWars.Pid

  # command
  # reset
  # create_enemy
  # kill_enemy

  def join("room:game", _auth_msg, socket) do
    ProcessWars.EnemyMonitor.start_link # TODO: fix position
    {:ok, socket}
  end

  def handle_in("kill", %{"pid" => pid_str}, socket) do
    pid = Pid.from_str(pid_str)
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

  # def handle_out("new_msg", payload, socket) do
  #   push socket, "new_msg", payload
  #   {:noreply, socket}
  # end
end