const DIRECTIONS = [ [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1] ]
const [LEFT, UP_LEFT, UP, UP_RIGHT, RIGHT, DOWN_RIGHT, DOWN, DOWN_LEFT] = DIRECTIONS
const DIRECTIONS_CARDINAL = [LEFT, UP, RIGHT, DOWN]

const constants = { LEFT, RIGHT, UP, DOWN, UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT, DIRECTIONS, DIRECTIONS_CARDINAL }
const methods   = { toString, fromString, toIndex, fromIndex, isEqual, isEdge, isInside, getNeighbors, getManhattan }

export default Object.assign(constants, methods)

function toString(cell) {
  return cell.toString()
}

function fromString(string) {
  return string.split(',').map(Number)
}

function toIndex(cell, size) {
  let [x, y] = cell
  return y * size + x
}

function fromIndex(index, size) {
  let x = index % size
  let y = (index - x) / size
  return [x, y]
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}

function isEdge(cell, size) {
  let [x, y] = cell
  let rect = [0, 0, size, size]
  if ( Array.isArray(size) )
    rect = size
  let [rectX, rectY, rectWidth, rectHeight] = rect
  return isInside(cell, size) && (x === rectX || x === rectX + rectWidth - 1 || y === rectY || y === rectY + rectHeight - 1)
}

function isInside(cell, size) {
  let [x, y] = cell
  let rect = [0, 0, size, size]
  if ( Array.isArray(size) )
    rect = size
  let [rectX, rectY, rectWidth, rectHeight] = rect
  return x >= rectX && y >= rectY && x < rectX + rectWidth && y < rectY + rectHeight
}

function getNeighbors(cell, diagonals, step) {
  if (!cell)
    throw new TypeError(`Cannot get neighbors of cell '${cell}'`)
  step = step || 1
  let [x, y] = cell
  let neighbors = []
  let directions = DIRECTIONS_CARDINAL
  if (diagonals)
    directions = DIRECTIONS
  for (let direction of directions) {
    let [dx, dy] = direction
    let current  = [x + dx * step, y + dy * step]
    let [cx, cy] = current
    neighbors.push( [cx, cy] )
  }
  return neighbors
}

function getManhattan(a, b) {
  var [ax, ay] = a
  var [bx, by] = b
  return Math.abs(ax - bx) + Math.abs(ay - by)
}
