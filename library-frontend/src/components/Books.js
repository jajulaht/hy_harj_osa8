import React, { useState } from 'react'

const Books = ({ result, show }) => {
  const [genre, setGenre] = useState('')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks.filter(book => {
    if (genre.length === 0) return book
    else return book.genres.includes(genre)
  })

  let allGenres = []
  result.data.allBooks.forEach(book => {
    book.genres.forEach(genre => {
      allGenres.push(genre)
    })
  })
  const uniqueSet = new Set(allGenres)
  const uniqueGenres = [...uniqueSet]

  const showGenre = () => {
    if (genre.length === 0) return 'Books in all genres'
    else return `Books in genre ${genre}`
  }

  return (
    <div>
      <h2>books</h2>
      <p>{ showGenre() }</p>
      <p>
        <button onClick={() => setGenre('')}>all genres</button>
        {uniqueGenres.map(b =>
          <button key={b} onClick={() => setGenre(b)}>{b}</button>
        )}
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books