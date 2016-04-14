var PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      // Minimum size of a partition in pixels
      minPartitionPixels: 8,
      // The {key} of the handle that we are currently dragging
      draggingHandle: false,
      colorGenerator: this.props.colorGenerator || new ColorGenerator(),
      // valid flag used if validatePartitions param is passed
      valid: true
    };
    this.validatePartitions();
  },

  _class: function(className) {
    return this.props.getClass ? this.props.getClass(className) : className;
  },

  validatePartitions: function() {
    if (this.props.validatePartitions) {
      if (this.props.validatePartitions(this.props.partitions)) {
        this.setState({valid: true});
      } else {
        this.setState({valid: false});
      }
    }
  },

  setPartitions: function(newPartitions) {
    this.props.handlePartitionChange(newPartitions);
    this.validatePartitions();
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
    partitions.splice(key, 1, {value: partition.value, tooltip: partition.tooltip, size: rightSize});
    partitions.splice(key, 0, {value: partition.value, tooltip: partition.tooltip, size: leftSize});
    this.setPartitions(partitions);
  },

  deletePartition: function(key, event) {
    // Delete the partition at {key} and resize the left partition
    // (if it exists, otherwise the right partition) so that it takes
    // up the room of the deleted partition
    var partitionSize = this.props.partitions[key].size,
        neighbourPartitionKey = key > 0 ? key - 1 : key + 1,
        neighbourPartition = this.props.partitions[neighbourPartitionKey],
        partitions = this.props.partitions.concat([]);
    partitions.splice(key, 1, {value: neighbourPartition.value, tooltip: neighbourPartition.tooltip, size: neighbourPartition.size + partitionSize});
    partitions.splice(neighbourPartitionKey, 1);
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
    partitions.splice(key, 2, {value: rightPartition.value, tooltip: rightPartition.tooltip, size: rightSize});
    partitions.splice(key, 0, {value: leftPartition.value, tooltip: leftPartition.tooltip, size: leftSize});
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

  handleDrop: function(key, event) {
    // Split the partition at {key} into two partitions by adding a new
    // partition to the left and resizing the original and new partition
    // so that the
    var partition = this.props.partitions[key],
        value = event.dataTransfer.getData('value'),
        tooltip = event.dataTransfer.getData('tooltip');
    var partitions = this.props.partitions.concat([]);
    partitions.splice(key, 1, {value: value, tooltip: tooltip, size: partition.size});
    this.setPartitions(partitions);
    if (this.props.handleDrop) this.props.handleDrop(key, {value: value, tooltip: tooltip});
  },

  // MOUNTING & UNMOUNTING

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

  // RENDERING

  renderMarkers: function(markers, className, totalSize) {
    if (!markers) return;
    var lastMarker, markerStep;
    if (typeof markers === 'number') {
      lastMarker = markers;
      markerStep = markers;
      markers = [];
      while (lastMarker < totalSize) {
        markers.push(lastMarker);
        lastMarker += markerStep;
      }
    }
    return markers.map(function(m, i) {
      var percent = m/totalSize;
      if (percent > 0.01 && percent < 0.99) {
        return (
          <div key={i}
               className={this._class('PartitionSelector_marker') + ' ' + this._class(className)}
               style={{left: this.percentAsString(percent)}} />
        );
      }
    }.bind(this));
  },

  renderLabels: function(labels, totalSize) {
    if (!labels) return;
    return labels.map((label, i) => (
      <div key={i} className={this._class('PartitionSelector_label')} style={{left: this.percentAsString(label[1]/totalSize)}}>{label[0]}</div>
    ));
  },

  renderPartition: function(partition, key, width) {
    // Takes a width in percent e.g. 0.42
    var tooltip,
        style = {
          width: this.percentAsString(width),
          backgroundColor: this.state.colorGenerator.getColor(partition.value),
        },
        resizing = partition.resizing ? this._class('PartitionSelector_resizing') : ''
        cellClasses = `${this._class('PartitionSelector_bar')} ${this._class('PartitionSelector_cell')} ${resizing}`,
        dragging = this.state.draggingHandle === key ? this._class('PartitionSelector_dragging') : '',
        handleClasses = `${this._class('PartitionSelector_handle')} ${dragging}`,
        handle = (key === this.props.partitions.length - 1) ? '' : (
          <div className={handleClasses}
               onMouseDown={(e) => this.startDragHandle(key, e)}>
          </div>
        );
    // TODO: Do we need this after changing to JS tooltips?
    // TODO: Or reconsider how we are doing CSS tooltips
    // We hide tooltips while dragging. Cells without a tooltip get no tooltip
    // instead of an empty one.
    if ((this.state.draggingHandle === false) && partition.tooltip) {
      tooltip = <div className={this._class('PartitionSelector_tooltip')}>{partition.tooltip}</div>;
    }
    return (
      <div key={key}
           ref={(ref) => this.saveCellRef(key, ref)}
           className={cellClasses}
           size={width}
           style={style}
           onClick={(e) => this.handleCellClick(key, e)}
           onDoubleClick={(e) => this.splitPartition(key, e)}
           onDragOver={(e) => e.preventDefault()}
           onDrop={(e) => this.handleDrop(key, e)}>
        {handle}
        {tooltip}
        <PartitionDraggableValue getClass={this._class}
                                 values={{
                                   value: partition.value,
                                   tooltip: partition.tooltip,
                                 }}>
        </PartitionDraggableValue>
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
    var totalSize = this.totalSize(),
        validClass = this._class('PartitionSelector_valid'),
        invalidClass = this._class('PartitionSelector_invalid'),
        partitions = this.props.partitions.map(function(partition, i) {
      return this.renderPartition(partition, i, partition.size / totalSize);
    }.bind(this));
    return (
      <div className={`${this._class('PartitionSelector')} ${this.props.customClass || ''}`}>
        <div className={`${this._class('PartitionSelector_parts')} ${this.state.valid ? validClass : invalidClass}`}>
          {partitions}
        </div>
        {this.renderMarkers(this.props.minorMarkers, 'PartitionSelector_marker_minor', totalSize)}
        {this.renderMarkers(this.props.majorMarkers, 'PartitionSelector_marker_major', totalSize)}
        {this.renderLabels(this.props.labels, totalSize)}
      </div>
    );
  }
});
