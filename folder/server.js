import express from 'express'
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database("quotes.db")

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded())

app.get('/', (req, res) => {
  db.all('SELECT * FROM quote', (err, rows) => {
    if (err) {
    console.error(err)
    res.status(500).send("Det gick inte att hämta .")
     return
    }
    res.render('index', { quotes: rows })
  })
})

app.get('/create', (req, res) => {
 res.render('create')
})

app.get('/delete', (req, res) => {
  db.all('SELECT * FROM quote', (err, rows) => {
    if (err) {
     console.error(err)
    res.status(500).send("Det gick inte att hämta.")
    return
    }
    res.render('delete', { quotes: rows })
  })
})

app.get('/update', (req, res) => {
  res.render('update') 
})

app.post('/api/quote', (req, res) => {
  const { text, author } = req.body
  if (!text || !author) {
  res.status(400).send("Text and author are required.")
  return
  }

  const stmt = db.prepare('INSERT INTO quote (text, author) VALUES (?, ?)')
  stmt.run(text, author, function (err) {
    if (err) {
      console.error(err)
      res.status(500).send("Failed to add.")
    return
    }
    stmt.finalize()
    res.send(`
      <p>Quote added successfully!</p>
      <a href="/">quotes list</a>
    `)
  })
})

app.put('/api/quote', (req, res) => {
  const { id, text, author } = req.body
  if (!id || !text || !author) {
    res.status(400).json({ success: false, message: "ID, text, and author are required." })
    return
  }

  const stmt = db.prepare('UPDATE quote SET text = ?, author = ? WHERE id = ?')
  stmt.run(text, author, id, function (err) {
    if (err) {
      console.error(err)
      res.status(500).json({ success: false, message: "Failed to update the quote." })
      return
    }
    stmt.finalize()
    res.json({ success: true })
  })
})

app.delete('/api/quote/:id', (req, res) => {
  const { id } = req.params
  const stmt = db.prepare('DELETE FROM quote WHERE id = ?')
  stmt.run(id, function (err) {
    if (err) {
      console.error(err)
      res.status(500).json({ success: false, message: "Failed to delete the quote." })
      return
    }
    stmt.finalize()
    res.json({ success: true })
  })
})

app.listen(3000, err => {
  if(err)
    console.error(err)
})
