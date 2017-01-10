defmodule ProcessWars.EnemySpawn do
  alias ProcessWars.EnemyUtil

  def start do
    pid = spawn(fn -> loop end)
    Process.register(pid, EnemyUtil.build_name("spawn"))
    pid
  end

  defp loop do
    receive do
      {:puts, msg} ->
        IO.puts(msg)
        loop
    end    
  end
end

defmodule ProcessWars.EnemyDynamicAtomCreator do
  alias ProcessWars.EnemyUtil
  require Logger;

  def start do
    pid = spawn(fn -> loop end)
    Process.register(pid, EnemyUtil.build_name("dynamicAtomCreator"))
    pid
  end

  defp loop do
    :timer.sleep(:timer.seconds(1))
    Logger.debug("EnemyDynamicAtomCreator.loop: #{:erlang.memory(:atom)}")
    for _ <- 1..10000 do UUID.uuid4() |> String.to_atom end
    loop
  end
end

defmodule ProcessWars.EnemySimpleOneForOne do
  use Supervisor
  alias ProcessWars.{EnemyChild, EnemyUtil}

  def start_link do
    name = EnemyUtil.build_name("simpleOneForOne")
    Supervisor.start_link(__MODULE__, [name], name: name)
  end

  def create_child(self_pid) do
    if Process.alive?(self_pid) do
      name = EnemyUtil.build_child_name(self_pid)
      Supervisor.start_child(self_pid, [name])
    end
  end

  def init(_args) do
    ProcessWars.EnemyTimer.register({__MODULE__, :create_child, [self()]})

    children = [
      worker(EnemyChild, [], restart: :permanent)
    ]
    options = [
      strategy: :simple_one_for_one,
    ]
    supervise(children, options)
  end
end

defmodule ProcessWars.EnemyOneForAll do
  use Supervisor
  alias ProcessWars.{EnemyChild, EnemyUtil}

  def start_link do
    name = EnemyUtil.build_name("oneForAll")
    Supervisor.start_link(__MODULE__, [name], name: name)
  end

  def init([name]) do
    children = for _ <- 1..4 do
      id = EnemyUtil.build_child_name(name)
      worker(EnemyChild, [id], restart: :permanent, id: id)
    end
    options = [
      strategy: :one_for_all,
    ]
    supervise(children, options)
  end
end
