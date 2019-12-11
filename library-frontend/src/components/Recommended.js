import React from 'react'

const Recommended = ({ show, genreResult, result }) => {
  
  if (!show) {
    return null
  }

  if (genreResult.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks.filter(book => {
    return book.genres.includes(genreResult.data.me.favoriteGenre)
  })

  return (
    <div>
      <h2>Recommendations</h2>
      <p>Books in your favorite genre <strong>{genreResult.data.me.favoriteGenre}</strong></p>
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

export default Recommended