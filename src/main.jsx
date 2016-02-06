
var PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      // Minimum size of a partition in pixels
      minPartitionPixels: 20,
      // The {key} of the handle that we are currently dragging
      draggingHandle: false,
    };
  },
  
  setPartitions: function(newPartitions) {
    this.props.handlePartitionChange(newPartitions);
  },
  
  totalSize: function() {
    // Sum of sizes of all partitions
    return this.props.partitions.map(p => p.size).reduce((a,b) => a + b, 0);
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
    var partition = this.props.partitions[key],
        boundingRect = event.target.getBoundingClientRect(),
        totalWidth = boundingRect.width,
        splitPoint = Math.min(Math.max(event.clientX - boundingRect.left, this.state.minPartitionPixels), totalWidth - this.state.minPartitionPixels),
        leftSize = partition.size * splitPoint / totalWidth,
        rightSize = partition.size - leftSize;
    var partitions = this.props.partitions.concat([]);
    partitions.splice(key, 1, {name: partition.name, size: rightSize});
    partitions.splice(key, 0, {name: 'N', size: leftSize});
    this.setPartitions(partitions);
  },
  
  deletePartition: function(key, event) {
    // Delete the partition at {key} and resize the left partition 
    // (if it exists, otherwise the right partition) so that it takes
    // up the room of the deleted partition
    var partitionSize = this.props.partitions[key].size,
        neighbourPartitionKey = key > 0 ? key - 1 : key + 1,
        partitions = this.props.partitions.concat([]);
    partitions.splice(key, 1, {name: this.props.partitions[neighbourPartitionKey], size: this.props.partitions[neighbourPartitionKey].size + partitionSize});
    partitions.splice(key, 1);
    this.setPartitions(partitions);
  },
  
  resizePartitionWithHandleAt: function(key, handleX) {
    var leftPartition = this.props.partitions[key],
        rightPartition = this.props.partitions[key+1],
        leftCell = this.getCellRef(key),
        rightCell = this.getCellRef(key+1),
        leftBounds = leftCell.getBoundingClientRect(),
        rightBounds = rightCell.getBoundingClientRect(),
        totalSize = leftPartition.size + rightPartition.size,
        totalBounds = leftBounds.width + rightBounds.width,
        leftSizePixels = Math.min(Math.max(handleX - leftBounds.left, this.state.minPartitionPixels), totalBounds - this.state.minPartitionPixels),
        leftSize = totalSize * leftSizePixels / totalBounds,
        rightSize = totalSize - leftSize;
    var partitions = this.props.partitions.concat([]);
    partitions.splice(key, 2, {name: rightPartition.name, size: rightSize});
    partitions.splice(key, 0, {name: leftPartition.name, size: leftSize});
    this.setPartitions(partitions);
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
      this.resizePartitionWithHandleAt(key, event.clientX)
    }
  },
  
  handleCellClick: function(key, event) {
    // Delete the clicked partition if it isn't the only partition left
    if (event.shiftKey && this.props.partitions.length > 1) {
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
        handle = (key === this.props.partitions.length - 1) ? '' : (
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
    var partitions = this.props.partitions.map(function(partition, i) {
      return this.renderPartition(partition, i, partition.size / totalSize);
    }.bind(this));
    return (
      <div className="partition-selector">
        {partitions}
      </div>
    );
  }
});



var Timesheet = React.createClass({
  getInitialState: function() {
    return {
      partitions: [
        {name: 'A', size: 10},
        {name: 'B', size: 20},
        {name: 'C', size: 40},
        {name: 'D', size: 5},
      ],
    };
  },
  
  handlePartitionChange: function(newPartitions) {
    this.setState({partitions: newPartitions});
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    return (
      <div>
        <PartitionSelector partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
        <ul>
          {list}
        </ul>
        <TimesheetTable partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
      </div>
    );
  }
});

var TimesheetTable = React.createClass({
  getInitialState: function() {
    return {
      
    };
  },
  
  updatePartitionSize: function() {
    
  },
  
  render: function() {
    return (
      <div>
        <table>
          <tbody>
            {this.props.partitions.map((p, i) => (
              <tr key={i}>
                <td>{p.name} ({i})</td>
                <td><input type="text" value={p.size} onChange={(e) => this.updatePartitionSize(i, e.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
});




ReactDOM.render(
  <Timesheet />,
  document.getElementById('bar')
);