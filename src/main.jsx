
var PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      // Minimum size of a partition in pixels
      minPartitionPixels: 20,
      // The {key} of the handle that we are currently dragging
      draggingHandle: false,
      // Array of partition cells
      partitions: [
        {name: 'A', size: 10},
        {name: 'B', size: 40},
        {name: 'C', size: 20},
        {name: 'D', size: 10},
      ]
    };
  },
  
  totalSize: function() {
    // Sum of sizes of all partitions
    return this.state.partitions.map(p => p.size).reduce((a,b) => a + b, 0);
  },
  
  percentAsString: function(width) {
    // Converts 0.42 -> "42%"
    // Using floor here ensures that we never add up to more than 100%
    return Math.floor(width * 10000) / 100 + '%';
  },
  
  splitPartition: function(key, event) {
    // Split the partition at {key} into two partitions by adding a new
    // partition to the left and resizing the original and new partition
    // so that the 
    var partition = this.state.partitions[key],
        boundingRect = event.target.getBoundingClientRect(),
        totalWidth = boundingRect.width,
        splitPoint = Math.min(Math.max(event.clientX - boundingRect.left, this.state.minPartitionPixels), totalWidth - this.state.minPartitionPixels),
        leftSize = partition.size * splitPoint / totalWidth,
        rightSize = partition.size - leftSize;
    console.log('splitting partition', key, partition);
    var partitions = this.state.partitions.concat([]);
    partitions.splice(key, 1, {name: partition.name, size: rightSize});
    partitions.splice(key, 0, {name: 'N', size: leftSize});
    console.log('new partitions', partitions);
    this.setState({partitions: partitions});
  },
  
  deletePartition: function(key, event) {
    // Delete the partition at {key} and resize the left partition 
    // (if it exists, otherwise the right partition) so that it takes
    // up the room of the deleted partition
    var partitionSize = this.state.partitions[key].size,
        // neighbourPartitionKey = key > 0 ? key - 1 : key + 1,
        partitions = this.state.partitions.concat([]);
    // partitions.splice(key, 1, {name: this.state.partitions[neighbourPartitionKey], size: this.state.partitions[neighbourPartitionKey].size + });
    partitions.splice(key, 1);
    this.setState({partitions: partitions});
  },
  
  resizePartitionWithHandleAt: function(key, handleX) {
    var leftPartition = this.state.partitions[key],
        rightPartition = this.state.partitions[key+1],
        leftCell = this.getCellRef(key),
        rightCell = this.getCellRef(key+1),
        leftBounds = leftCell.getBoundingClientRect(),
        rightBounds = rightCell.getBoundingClientRect(),
        totalSize = leftPartition.size + rightPartition.size,
        totalBounds = leftBounds.width + rightBounds.width,
        leftSizePixels = Math.min(Math.max(handleX - leftBounds.left, this.state.minPartitionPixels), totalBounds - this.state.minPartitionPixels),
        leftSize = totalSize * leftSizePixels / totalBounds,
        rightSize = totalSize - leftSize;
    var partitions = this.state.partitions.concat([]);
    partitions.splice(key, 2, {name: rightPartition.name, size: rightSize});
    partitions.splice(key, 0, {name: leftPartition.name, size: leftSize});
    this.setState({partitions: partitions});
  },
  
  // Set or clear the currently dragged handle state
  startDragHandle: function(key, event) {
    this.setState({draggingHandle: key});
  },
  stopDragHandle: function(event) {
    if (this.state.draggingHandle !== false) {
      this.setState({draggingHandle: false});
    }
  },
  
  moveDragHandle: function(event) {
    // If we are currently dragging one of the handles, move it to
    // the mouse cursor position
    if (this.state.draggingHandle !== false) {
      var key = this.state.draggingHandle;
      this.resizePartitionWithHandleAt(key, )
    }
  },
  
  handleCellClick: function(key, event) {
    // Delete the clicked partition if it isn't the only partition left
    if (event.shiftKey && this.state.partitions.length > 1) {
      this.deletePartition(key);
    }
  },
  
  componentDidMount: function() {
    // Register event handlers on the document for mouseup and mousemove since
    // we want these to fire even the the user is not over our component
    document.addEventListener('mouseup', this.stopDragHandle);
    document.addEventListener('mousemove', this.moveDragHandle);
  },
  
  componentWillUnmount: function() {
    // Clean up the event handlers!
    document.removeEventListener('mouseup', this.stopDragHandle);
    document.removeEventListener('mousemove', this.moveDragHandle);
  },
  
  renderPartition: function(partition, key, width) {
    // Takes a width in percent e.g. 0.42
    var style = {width: this.percentAsString(width)},
        resizing = partition.resizing ? 'resizing' : ''
        cellClasses = `cell ${resizing}`,
        dragging = this.state.draggingHandle === key ? 'dragging' : '',
        handleClasses = `handle ${dragging}`,
        handle = (key === this.state.partitions.length - 1) ? '' : (
          <div className={handleClasses}
               onMouseDown={(e) => this.startDragHandle(key, e)}>
          </div>
        );
    return (
      <div ref={(ref) => this.saveCellRef(key, ref)}
           key={key}
           className={cellClasses}
           size={width}
           style={style}
           onClick={(e) => this.handleCellClick(key, e)}
           onDoubleClick={(e) => this.splitPartition(key, e)}>
        {partition.name}
        {handle}
      </div>
    );
  },
  
  // Store and get the reference to the DOM node for a cell at index {key}
  saveCellRef: function(key, ref) {
    if (!this.cellRefs) this.cellRefs = [];
    this.cellRefs[key] = ref;
  },
  getCellRef: function(key) {
    return this.cellRefs[key];
  },
  
  render: function() {
    var totalSize = this.totalSize();
    var partitions = this.state.partitions.map(function(partition, i) {
      return this.renderPartition(partition, i, partition.size / totalSize);
    }.bind(this));
    return (
      <div className="partition-selector">
        {partitions}
      </div>
    );
  }
});

ReactDOM.render(
  <PartitionSelector />,
  document.getElementById('bar')
);