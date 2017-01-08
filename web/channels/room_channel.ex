defmodule ProcessWars.EnemyChild do
  use GenServer

  def start_link() do
    GenServer.start_link(__MODULE__, [])
  end

  def start_link(name) do
    GenServer.start_link(__MODULE__, [], name: name)
  end

  def init(state) do
    {:ok, state}
  end
end

# ProcessWars.EnemySupervisor.start_link()
# ProcessWars.EnemySupervisor.create_child(:test)
# pid = Process.whereis(ProcessWars.EnemySupervisor)
# {_, c_pid, _, _} = Supervisor.which_children(pid) |> Enum.at(0)
# Process.info(c_pid)
# Process.exit(c_pid, :kill)


defmodule ProcessWars.EnemySupervisor do
  use Supervisor
  # use GenServer
  # use Application

  alias ProcessWars.EnemySupervisor
  alias ProcessWars.EnemyChild

  def start_link do
    ran = UUID.uuid4() |> String.split("-") |> List.last
    name = "enemy_oneForOne_#{ran}" |> String.to_atom
    IO.inspect(name)

    # Supervisor.start_link(__MODULE__, [], name: __MODULE__)
    Supervisor.start_link(__MODULE__, [], name: name)
  end

  def create_child(self_name, name) do
    # Supervisor.start_child(EnemySupervisor, [name])
    Supervisor.start_child(self_name, [name])
  end

  def init(_args) do
    children = [
      worker(EnemyChild, [], restart: :permanent)
    ]
    options = [
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