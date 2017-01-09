defmodule ProcessWars.EnemyUtil do
  def build_name(type, is_child \\ false) do
    ran = UUID.uuid4() |> String.split("-") |> List.last
    prefix = if is_child, do: "enemy", else: "enemyChild"
    "#{prefix}_#{type}_#{ran}" |> String.to_atom
  end
end
