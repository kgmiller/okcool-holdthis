module.exports = class OkCoolHoldThis {
  constructor(maxItems = 50000) {
    this.maxItems = maxItems
    this.currentItems = 0
    this.cache = {}
    this.frequencyList = new FrequencyList()
    this.newAccessAverage = .0001
  }
  
  trySet(key, value, accessCount = 0, firstAccess = 0) {
    
    if (this.currentItems == this.maxItems) {
      if (accessCount == 0 && this.frequencyList.tail.frequency > this.newAccessAverage) {
        return false
      }
      if ((accessCount / (lastAccess - firstAccess)) > this.frequencyList.tail.frequency) {
        this.delete(this.frequencyList.tail.value)
        this.set(key, value, accessCount, firstAccess)
      }  
    }
    else {
      this.set(key, value, accessCount, firstAccess)
    }
    
    this.currentItems++
    
    return true
  }
  
  set(key, value, accessCount, firstAccess) {
    if (accessCount == 0) {
      accessCount == 1
      firstAccess = Date.now()
      var lastAccess = firstAccess + 1000
    }
    
    var node = this.frequencyList.add(key, accessCount, firstAccess, lastAccess)
    
    this.cache[key] = {
      value: value,
      frequencyNode: node
    }
  }
  
  get(key) {
    var value = this.cache[key]
    
    if (value) {
      value.frequencyNode.accessCount++
      value.frequencyNode.lastAccess = Date.now()
      
      if (!value.frequencyNode.isHead && value.frequencyNode.averageFrequency() > value.frequencyNode.previous.averageFrequency(value.frequencyNode.lastAccess)) {
        this.frequencyList.promote(value.frequencyNode)
      }
      else if (!value.frequencyNode.isTail && value.frequencyNode.averageFrequency() < value.frequencyNode.next.averageFrequency(value.frequencyNode.lastAccess)) {
        this.frequencyList.demote(value.frequencyNode)
      }
    }
    else {
      return null
    }
    
    return value.value
  }
}


class FrequencyList {
  constructor() {
    this.head = new FrequencyListNode()
    this.head.isHead = true
    
    this.tail = new FrequencyListNode(this.head, null)
    this.tail.isTail = true
    
    this.head.previous = null
    this.head.next = this.tail
  }
  
  add(key, accessCount, firstAccess, lastAccess) {
    var newNode = new FrequencyListNode(this.tail, null)
    this.tail.isTail = false
    newNode.isTail = true
    this.tail.next = newNode
    this.tail = newNode
    this.tail.accessCount = accessCount
    this.tail.firstAccess = firstAccess
    this.tail.lastAccess = lastAccess
    this.tail.value = key
    return this.tail
  }
  
  promote(node) {    
    var oldNext = node.next
    node.next = node.previous
    node.next.next = oldNext
    node.previous = node.next.previous
    node.next.previous = node
    node.isHead = node.next.isHead
    node.next.isHead = false
    node.next.isTail = node.isTail
    node.isTail = false
    
    if (node.isHead) {
      this.head = node
    }
  }
  
  demote(node) {
    
    var oldPrevious = node.previous
    node.previous = node.next
    node.next = node.previous.next
    node.previous.next = node
    node.previous.previous = oldPrevious
    node.isTail = node.previous.isTail
    node.previous.isTail = false
  }
}

class FrequencyListNode {
  constructor(previous = null, next = null) {
    this.value = {}
    this.accessCount = 0
    this.firstAccess = 0
    this.lastAccess = 0
    this.previous = previous
    this.next = null
    this.isHead = false
    this.isTail = false
  }
  
  averageFrequency(lastAccess = null) {
    if (this.lastAccess == 0 || this.firstAccess == 0) {
      return 0
    }
    
    if (!lastAccess) {
      var lastAccess = this.lastAccess
    }
    
    return this.accessCount / (lastAccess - this.firstAccess)
  }
}
