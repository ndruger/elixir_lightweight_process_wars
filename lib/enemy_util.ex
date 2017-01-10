defmodule ProcessWars.EnemyUtil do
  alias ProcessWars.Pid

  @re ~r/(?<prefix>.+)_(?<type>.+)_(?<parent_id>.+)(_(?<child_id>.+))?/

  def random_str() do
    UUID.uuid4() |> String.split("-") |> List.last
  end

  def build_name(type) do
    "enemy_#{type}_#{random_str}" |> String.to_atom
  end

  def build_child_name(parent_pid) when is_pid(parent_pid) do
    build_child_name(Pid.name(parent_pid))
  end

  def build_child_name(parent_name) when is_atom(parent_name) do
    parent_name_str = parent_name |> to_string
    %{"type" => type, "parent_id" => parent_id} = Regex.named_captures(@re, parent_name_str)
    "enemyChild_#{type}_#{parent_id}_#{random_str}" |> String.to_atom
  end

  def prefix(pid) when is_pid(pid) do
    name = pid |> Pid.name |> to_string
    case Regex.named_captures(@re, name) do
      %{"prefix" => v} -> v
      _ -> ""
    end
  end

  def is_enemy(pid) when is_pid(pid) do
    prefix(pid) == "enemy"
  end

  def is_enemy_child(pid) when is_pid(pid) do
    prefix(pid) == "enemyChild"
  end
end
