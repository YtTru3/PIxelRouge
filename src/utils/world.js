import { Cell, Rect } from './index'

const [FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS] = [0, 1, 2, 3, 4, 5]
const tiles = [
  {
    name: 'floor',
    walkable: true
  },
  {
    name: 'wall',
    opaque: true
  },
  {
    name: 'door',
    opaque: true,
    door: true
  },
  {
    name: 'door_open',
    walkable: true,
    door: true
  },
  {
    name: 'door_hidden',
    opaque: true,
    door: true,
    hidden: true
  },
  {
    name: 'stairs',
    walkable: true,
    stairs: true
  }
]

let costs = []
for (let tile of tiles) {
  let cost = 0
  if (!tile.walkable && !tile.door)
    cost = Infinity
  if (tile.hidden)
    cost = 1000
  if (tile.door) {
    cost++
    if (!tile.walkable)
      cost++
  }
  costs.push(cost)
}

const constants = { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS, tiles, costs }
const methods   = { create, fill, clear, getAt, setAt, getSize, findPath }
const World     = Object.assign({}, constants, methods)

export default World

let sqrt = function (cache) {

  cache = cache || {}

  return function sqrt(num) {
    let cached = cache[num]
    if (cached)
      return cached
    let result = cache[num] = Math.sqrt(num)
    return result
  }

}()

function create(size) {
  return new Uint8ClampedArray(size * size)
}

function fill(data, id, rect) {
  if (typeof id === 'undefined')
    id = WALL
  let size = getSize(data)
  if (rect) {
    let cells = Rect.getCells(rect)
    for (let cell of cells)
      setAt(data, cell, id)
  } else {
    let i = data.length
    while (i--)
      data[i] = id
  }
  return data
}

function clear(data) {
  fill(data, FLOOR)
  return data
}

function getAt(data, cell) {
  let size = getSize(data)
  if ( !Cell.isInside(cell, size) )
    return null
  let index = Cell.toIndex(cell, size)
  return data[index]
}

function setAt(data, cell, value) {
  let size = getSize(data)
  if ( !Cell.isInside(cell, size) )
    return null
  let index = Cell.toIndex(cell, size)
  data[index] = value
  return value
}

function getSize(data) {
  return sqrt(data.length)
}

function findPath(data, start, goal, costs, diagonals) {

  if (!costs)
    costs = {
      tiles: World.costs,
      cells: {}
    }

  if (!costs.tiles)
    costs = {
      tiles: costs,
      cells: {}
    }

  if (costs.tiles[ World.getAt(data, goal) ] === Infinity)
    return null

  let path = []

  let size = getSize(data)

  let startId = start.toString()
  let goalId  = goal.toString()

  let opened = [startId]
  let closed = {}

  let scores = { f: {}, g: {} }
  let parent = {}

  let cells = data.reduce( (cells, id, index) => cells.concat( [ Cell.fromIndex(index, size) ] ), [] )
  for (let cell of cells) {
    scores.g[cell] = Infinity
    scores.f[cell] = Infinity
  }

  scores.g[start] = 0
  scores.f[start] = Cell.getManhattan(start, goal)

  while (opened.length) {
    if (opened.length > 1)
      opened = opened.sort( (a, b) => scores.f[b] - scores.f[a] )
    let cellId = opened.pop()
    let cell = Cell.fromString(cellId)
    if (cellId === goalId) {
      let cell = goal
      do {
        path.unshift(cell)
        cell = parent[cell]
      } while (cell)
      return path
    }
    closed[cell] = true
    for ( let neighbor of Cell.getNeighbors(cell, diagonals) ) {
      if (!Cell.isInside(neighbor, size) || neighbor in closed)
        continue
      let id = neighbor.toString()
      let tileCost = costs.tiles[ getAt(data, neighbor) ] || 0
      let cellCost = costs.cells[neighbor] || 0
      let cost = tileCost + cellCost
      if (!id === goalId && cost === Infinity)
        continue
      let g = scores.g[cell] + 1 + cost
      if ( !opened.includes(id) )
        opened.push(id)
      else if ( g >= scores.g[neighbor] )
        continue
      parent[neighbor] = cell
      scores.g[neighbor] = g
      scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal)
    }
  }

  return null

}