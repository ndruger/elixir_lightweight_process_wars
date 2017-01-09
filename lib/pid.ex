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
      {:registered_name, []} -> ""
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
