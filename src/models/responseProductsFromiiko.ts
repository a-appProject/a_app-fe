export type Stats = {
  added: number,
  updated: number,
  deleted: number,
  total: number
}

type Resp = {
  message: string,
  statistics: Stats,
  success: boolean,
  timestamp: string
}

export default Resp