import React, { Component } from 'react'
import {Form, FormGroup, ControlLabel, FormControl} from 'react-bootstrap'
import {ProgressBar, Button, Modal, Panel} from 'react-bootstrap'
import {Record, List} from 'immutable'

class ScheduleComponent extends Component {
  render() {
    let handleDeleteBlock = this.props.handleDeleteBlock
    let handleEditBlock = this.props.handleEditBlock
    let schedule = this.props.schedule.map(function(block, index){  
      return(
	<Panel key={index}>
	  <Panel.Heading>
	    <Panel.Title toggle>
	      {block.title}
	    </Panel.Title>
	  </Panel.Heading>
	  <Panel.Collapse>
	    <Panel.Body>
	      <BlockComponent block={block} index={index} handleDeleteBlock={handleDeleteBlock} handleEditBlock={handleEditBlock} />
	    </Panel.Body>
	  </Panel.Collapse>
	</Panel>
      );
    });
    return (
      <div>
        {schedule}
      </div>
    );
  }
}
class BlockComponent extends Component {
  constructor(){
    super();
    this.state = {
      isEditing: true
    }
  }
  deleteBlock(e) {
    this.props.handleDeleteBlock(this.props.index)
  }
  editBlock(title, blockTime) {
    this.props.handleEditBlock(this.props.index, title, blockTime)
  }
  render(){
    return (
      <div>
	<ul>
	  <li>Title: {this.props.block.title}</li>
	  <li>Length: {this.props.block.length}</li>
	  <li>Color: {this.props.block.color}</li>
	</ul>
	<div>
	  <Button
	    bsStyle="primary"
	    bsSize="large"
	    onClick={this.deleteBlock.bind(this)}
	  >
	    Delete
	  </Button>
	  <EditBlockComponent handleSave={this.editBlock.bind(this)} isEditMode={true} block={this.props.block}/>
	</div>
      </div>  
    );
  }
}

class EditBlockComponent extends Component {
  constructor(){
    super();
    this.state = {
      showModal: false,
      block: TimeBlock(),
    }
    this.modalStyle = {
      height: 200
    }
  }
  componentWillMount() {
    if (this.props.isEditMode) {
      this.setState({ block: this.props.block })
    }
  }
  close() {
    this.setState({ showModal: false });
  }
  open() {
    this.setState({ showModal: true });
  }
  onTitleChange(e) {
    let title = e.target.value
    this.setState({ block: this.state.block.set('title', title) })
  }
  onLengthChange(e) {
    let length = e.target.value
    this.setState({ block: this.state.block.set('length', length) })
  }
  onColorChange(e) {
    let color = e.target.value
    this.setState({ block: this.state.block.set('color', color) })
  }
  save(e) {
    e.preventDefault()
    this.props.handleSave(this.state.block)
    this.setState({ block: TimeBlock() })
    this.close()
  }

  render(){
    return (
      <div className="modal-container" style={this.modalStyle}>
        <Button
          bsStyle="primary"
          bsSize="large"
          onClick={this.open.bind(this)}
        >
          {this.props.isEditMode ? "Edit" : "Add"}
        </Button>

        <Modal
          show={this.state.showModal}
          onHide={this.close.bind(this)}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">{this.props.isEditMode ? this.props.block.title : "Add"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
	    <Form horizontal>
	      <FormGroup controlId="formInlineName">
		<ControlLabel>Title:</ControlLabel>
		<FormControl type="text" onChange={this.onTitleChange.bind(this)} value={this.state.block.title} placeholder="Enter title" />
	      </FormGroup>
	      <FormGroup controlId="formInlineEmail">
		<ControlLabel>Length:</ControlLabel>
		<FormControl type="text" onChange={this.onLengthChange.bind(this)} value={this.state.block.length} placeholder="Enter length in seconds" />
	      </FormGroup>
	      <FormGroup controlId="formControlsSelect">
		<ControlLabel>Color:</ControlLabel>
		<FormControl componentClass="select" onChange={this.onColorChange.bind(this)} value={this.state.block.color} placeholder="select">
		  <option value="red">red</option>
		  <option value="blue">blue</option>
		  <option value="green">green</option>
		</FormControl>
	      </FormGroup>
	    </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close.bind(this)}>Close</Button>
            <Button onClick={this.save.bind(this)}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class TimerItem extends React.Component {
  render() {
    let currentTime = this.props.currentTime;
    let totalTime = this.props.totalTime;
    let now = 100*currentTime/totalTime;
    return (
      <div>
	<ProgressBar bsStyle="success" now={now} />
      </div>
    );     
  }
}

const RUNNING = 'running'
const STOPPED = 'stopped'
const TimeBlock = Record({
  title: 'Title',
  length: 30,
  color: 'red'
})
const Timer = Record({
  status: STOPPED,
  blockIndex: 0,
  blockTime: 0
})
class App extends React.Component {
  constructor(){
    super();
    this.state = {
      schedule: 
        List([
          TimeBlock({
            title: "Introduction", 
	    length: 5,
          }),
          TimeBlock({
            title: "Google time", 
	    length: 10,
          }),
          TimeBlock({
            title: "Facebook time", 
	    length: 10,
          })
	]),
      timer: Timer(),
    };
  }
  tick() {
    if (this.state.timer.status === RUNNING) {
      let timeBlock = this.state.schedule.get(this.state.timer.blockIndex)
      if (this.state.timer.blockTime === 0) {
	let msg = timeBlock.title+' '+timeBlock.length + ' seconds'
	var text = new SpeechSynthesisUtterance(msg)
	window.speechSynthesis.speak(text)
      }
      let timer = this.state.timer
      if (this.state.timer.blockTime+2 === timeBlock.length) {
	let msg = 'Times up'
	var text = new SpeechSynthesisUtterance(msg)
	window.speechSynthesis.speak(text)
      }
      if (this.state.timer.blockTime >= timeBlock.length) {
	timer = timer.set('blockTime', 0)
	timer = timer.set('blockIndex', (timer.blockIndex+1)%this.state.schedule.size)
	this.setState({timer:timer})
      } else {
	this.setState({timer: timer.set('blockTime', timer.blockTime+1)})
      }
    }
  }
  componentDidMount(){
    this.timer = setInterval(this.tick.bind(this), 1000)
  }
  addBlock(block) {			
    this.setState({ schedule: this.state.schedule.push(block) })
  }
  editBlock(index, block) {			
    this.setState({ schedule: this.state.schedule.set(index, block) })
  }
  deleteBlock(index) {
    this.setState({ schedule: this.state.schedule.delete(index) })
  }
  resetTimer() {
    this.setState({ timer: this.state.timer.set('blockTime', 0).set('blockIndex', 0) })
  }
  startTimer() {
    this.setState({ timer: this.state.timer.set('status', RUNNING) })
  }
  stopTimer() {
    this.setState({ timer: this.state.timer.set('status', STOPPED) })
  }
  render(){
    let timer = null
    let schedule = null;
    if (this.state.timer.status === STOPPED) {
      schedule = (
	<div>
	  <ScheduleComponent schedule={this.state.schedule} handleEditBlock={this.editBlock.bind(this)} handleDeleteBlock={this.deleteBlock.bind(this)}/>
	  <EditBlockComponent handleSave={this.addBlock.bind(this)} isEditMode={false}/>
	</div>
      )
    } else {
      let timeBlock = this.state.schedule.get(this.state.timer.blockIndex);
      timer = (
	<div>
	  <div>{timeBlock.title}</div>
	  <TimerItem currentTime={this.state.timer.blockTime} totalTime={timeBlock.length} />
	</div>
      )
    }
    return (
      <div>
      	{schedule}
	{timer}
        <Button onClick={this.startTimer.bind(this)} bsStyle="primary" bsSize="large" active>
          Start timer
        </Button>
        <Button onClick={this.stopTimer.bind(this)} bsStyle="primary" bsSize="large" active>
          Stop timer
        </Button>
        <Button onClick={this.resetTimer.bind(this)} bsStyle="primary" bsSize="large" active>
          Reset timer
        </Button>
      </div>
    );
  }
}
export default App;
