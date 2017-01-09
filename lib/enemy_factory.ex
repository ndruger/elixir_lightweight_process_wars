
defmodule ProcessWars.EnemyFactory do
  def create("simple_one_for_one") do
    {:ok, pid} = ProcessWars.SimpleOneForOneEnemy.start_link()
    Process.unlink(pid)
  end
end
