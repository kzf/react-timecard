
var PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      minPartitionPixels: 20,
      draggingHandle: false,
      partitions: [
        {name: 'A', size: 10},
        {name: 'B', size: 40},
        {name: 'C', size: 20},
        {name: 'D', size: 10},
      ]
    };
  },
  totalSize: function() {
    return this.state.partitions.map(p => p.size).reduce((a,b) => a + b, 0);
  },
  calculatePercentWidth: function(width) {
    return Math.round(width * 10000) / 100 + '%';
  },
  splitPartition: function(key, event) {
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
  
  startDragHandle: function(key, event) {
    console.log('starting dragging', key);
    this.setState({draggingHandle: key});
  },
  
  stopDragHandle: function(event) {
    if (this.state.draggingHandle !== false) {
      console.log('stopping dragging');
      this.setState({draggingHandle: false});
    }
  },
  
  moveDragHandle: function(event) {
    if (this.state.draggingHandle !== false) {
      console.log('moving drag handle');
      var key = this.state.draggingHandle,
          leftPartition = this.state.partitions[key],
          rightPartition = this.state.partitions[key+1],
          leftCell = this.cellRefs[key],
          rightCell = this.cellRefs[key+1],
          leftBounds = leftCell.getBoundingClientRect(),
          rightBounds = rightCell.getBoundingClientRect(),
          totalSize = leftPartition.size + rightPartition.size,
          totalBounds = leftBounds.width + rightBounds.width,
          leftSize = totalSize * (event.clientX - leftBounds.left) / totalBounds,
          rightSize = totalSize - leftSize;
      console.log('totalBounds', totalBounds, 'clientX-leftbounds', event.clientX - leftBounds.left);
      console.log('got left size:', leftSize, 'rightSize: ', rightSize)
      // console.log('leftbounds', leftBounds);
      // console.log(event.clientX);
      var partitions = this.state.partitions.concat([]);
      partitions.splice(key, 2, {name: rightPartition.name, size: rightSize});
      partitions.splice(key, 0, {name: leftPartition.name, size: leftSize});
      this.setState({partitions: partitions});
    }
  },
  
  handleCellClick: function(key, event) {
    if (event.shiftKey && this.state.partitions.length > 1) {
      console.log('handled delete cell', key);
      var partitions = this.state.partitions.concat([]);
      partitions.splice(key, 1);
      this.setState({partitions: partitions});
    }
  },
  
  componentDidMount: function() {
    document.addEventListener('mouseup', this.stopDragHandle);
    document.addEventListener('mousemove', this.moveDragHandle);
  },
  
  componentWillUnmount: function() {
    document.removeEventListener('mouseup', this.stopDragHandle);
    document.removeEventListener('mousemove', this.moveDragHandle);
  },
  
  renderPartition: function(partition, key, width) {
    // takes a width in percent e.g. 0.42
    var style = {width: this.calculatePercentWidth(width)},
        dragging = this.state.draggingHandle === key ? 'dragging' : '',
        handleClasses = `handle ${dragging}`,
        resizing = partition.resizing ? 'resizing' : ''
        cellClasses = `cell ${resizing}`;
    return (
      <div ref={(ref) => this.saveCellRef(key, ref)}
           key={key}
           className={cellClasses}
           size={width}
           style={style}
           onClick={(e) => this.handleCellClick(key, e)}
           onDoubleClick={(e) => this.splitPartition(key, e)}>
        {partition.name}
        <div className={handleClasses}
             onMouseDown={(e) => this.startDragHandle(key, e)}>
        </div>
      </div>
    );
  },
  
  saveCellRef: function(key, ref) {
    if (!this.cellRefs) this.cellRefs = [];
    this.cellRefs[key] = ref;
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