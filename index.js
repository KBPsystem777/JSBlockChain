"use strict"
var express = require("express")
var app = express()
app.use(express.json())
const Blockchain = require("./blockchain")

function uuidv4() {
  return "xxxxxxxx-xxxx-KBPxxxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    }
  )
}

let node_id = uuidv4()

app.get("/", function (req, res) {
  res.json(Blockchain)
})

app.get("/chain", function (req, res) {
  res.json(Blockchain.chain)
})

app.get("/mine", function (req, res) {
  var last_proof
  let last_block = Blockchain.last_block()
  if (last_block === 0) {
    last_proof = 0
  } else {
    last_proof = last_block.proof
  }
  var proof = Blockchain.proof_of_work(last_proof)

  /*  
        Add a bitcoin for the miner
        0 in sender means it is being mined (no sender, sender is the blockchain)
        recipient is node ID
    */
  var index = Blockchain.new_transaction(0, node_id, 1)

  let previous_hash = Blockchain.hash(last_block)
  let block = Blockchain.new_block(proof, previous_hash)

  res.json(block)
})

app.post("/transactions/new", function (req, res) {
  if (
    req.body.sender == "" ||
    req.body.amount == "" ||
    req.body.recipient == ""
  ) {
    res.json("Missing values")
  }
  let index = Blockchain.new_transaction(
    req.body.sender,
    req.body.recipient,
    req.body.amount
  )
  res.json({
    message: "Transaction will be added to block " + index,
    data: {
      sender: req.body.sender,
      amount: req.body.amount,
      recipient: req.body.recipient,
    },
  })
})

app.post("/nodes/register", function (req, res) {
  var nodes = req.body.nodes
  if (nodes === "") {
    res.send("Provide a list of nodes or leave me alone")
  }
  nodes.forEach((element) => {
    Blockchain.register_node(element)
  })
  res.json("Nodes will be added to the block ")
})

app.get("/nodes/resolve", function (req, res) {
  var replaced = Blockchain.resolve_conflicts()
  res.json(Blockchain)
})
var myArgs = 3030 //process.argv.slice(2)[0] || 5000
console.log("Launching JSBlockChain in port: ", myArgs)

var server = app.listen(myArgs, function () {})
