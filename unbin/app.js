const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const uuid = require("uuid").v4
const cors = require("cors")
const http = require("http")
const bodyParser = require("body-parser")
const swaggerUi = require("swagger-ui-express")
const YAML = require("yamljs")
const swaggerDocument = YAML.load("./swagger.yaml")

const app = express()
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const generatedApiKey = uuid() // Generate a new API key on startup
console.log(`API key: ${generatedApiKey}`)

const db = new sqlite3.Database("unbin.db")

// Middleware to check for API key in custom HTTP header
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]
  if (!apiKey || apiKey !== generatedApiKey) {
    res.status(401).json({ message: "Unauthorized - Check your API Key!" })
  } else {
    next()
  }
}

// Endpoint to return the session api key
app.get("/apikey", (req, res) => {
  res.json({ apiKey: generatedApiKey })
})

// Endpoint to retrieve all pastebin entries
app.get("/pastes", apiKeyMiddleware, (req, res) => {
  db.all("SELECT * FROM pastes", (err, rows) => {
    if (err) throw err
    res.json(rows)
  })
})

// Endpoint to create a new pastebin entry
app.post("/create-paste", apiKeyMiddleware, (req, res) => {
  const { title, text } = req.body
  if (!text || text.trim() === "") {
    res.status(400).json({ message: "Text cannot be empty" })
  } else if (!title || title.trim() === "") {
    res.status(400).json({ message: "Title cannot be empty" })
  } else {
    const date = new Date().toISOString()
    db.run(
      "INSERT INTO pastes (title, text, date) VALUES (?, ?, ?)",
      [title, text, date],
      (err) => {
        if (err) throw err
        res.json({ message: "Data successfully written to database" })
      }
    )
  }
})

// Endpoint to update a pastebin entry by ID
app.put("/update-paste/:id", apiKeyMiddleware, (req, res) => {
  const { id } = req.params
  const { title, text } = req.body
  if (!text || text.trim() === "" || !title || title.trim() === "") {
    res.status(400).json({ message: "Both title and text cannot be empty" })
  } else {
    console.log(`Updating paste with ID ${id}: ${title} - ${text}`)
    db.run(
      "UPDATE pastes SET title = ?, text = ? WHERE id = ?",
      [title, text, id],
      (err) => {
        if (err) throw err
        res.json({ message: `Paste with ID ${id} has been updated` })
      }
    )
  }
})

// Endpoint to delete a pastebin entry by ID
app.delete("/delete-paste/:id", apiKeyMiddleware, (req, res) => {
  const { id } = req.params
  db.run("DELETE FROM pastes WHERE id = ?", id, (err) => {
    if (err) throw err
    res.json({ message: `Paste with ID ${id} has been deleted` })
  })
})

module.exports = app
