import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks'

const ALL_AUTHORS = gql`
  {
    allAuthors  {
      name
      id
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  {
    allBooks  {
      title
      author {
        name
        born
        id
      }
      published
    }
  }
`

const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
      born
      id
    }
    published
    genres
  }
}
`

const EDIT_YEAR = gql`
mutation editYear($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo)  {
    name
    born
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const [addBook] = useMutation(CREATE_BOOK, {
    //onError: handleError,
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS }
    ]
  })
  const [editAuthor] = useMutation(EDIT_YEAR, {
    refetchQueries: [
      { query: ALL_AUTHORS }
    ]
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        result={authors}
        editAuthor={editAuthor}
        show={page === 'authors'}
      />

      <Books
        result={books}
        show={page === 'books'}
      />

      <NewBook
        addBook={addBook}
        setPage={setPage}
        show={page === 'add'}
      />

    </div>
  )
}

export default App