# {:ok, pid} = ProcessWars.SimpleOneForOneEnemy.start_link()
# Supervisor.which_children(pid)
# {_, c_pid, _, _} = Supervisor.which_children(pid) |> Enum.at(0)
# Process.info(c_pid)
# Process.exit(c_pid, :kill)

# {:ok, pid} = ProcessWars.SimpleOneForOneEnemy.start_link()
# Process.unlink(pid)
# Process.exit(pid, :kill)

defmodule ProcessWars.SimpleOneForOneEnemy do
  use Supervisor

  alias ProcessWars.EnemyChild
  alias ProcessWars.EnemyUtil

  def start_link do
    name = EnemyUtil.build_name("simpleOneForOne")
    Supervisor.start_link(__MODULE__, [name], name: name) |> IO.inspect()
  end

  def create_child(self_pid) do
    name = EnemyUtil.build_name("simpleOneForOneChild", true)
    if Process.alive?(self_pid) do
      Supervisor.start_child(self_pid, [name])
    end
  end

  def init(_args) do
    ProcessWars.EnemyTimer.register({__MODULE__, :create_child, [self()]})

    children = [
      worker(EnemyChild, [], restart: :permanent)
    ]
    options = [
      strategy: :simple_one_for_one
    ]
    supervise(children, options)
  end
end
