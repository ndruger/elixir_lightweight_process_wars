// @flow

class Pid {
  static toSafe(id: string) {
    return id.replace(/\./g, '_').replace(/[\<\>]/g, '');
  }

  static toUnSafe(safeId: string) {
    return `<${safeId.replace(/_/g, '.')}>`;
  }
}

export default Pid;
