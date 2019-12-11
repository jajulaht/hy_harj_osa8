import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql } from 'apollo-boost'
import { useQuery, useMutation, useApolloClient, useSubscription } from '@apollo/react-hooks'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

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

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
  author {
    name
    born
    id
  }
  published
  genres
}
`

const ALL_BOOKS = gql`
  {
    allBooks  {
      ...BookDetails
    }
  }
${BOOK_DETAILS}
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

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

const MY_GENRE = gql`
  {
    me {
      favoriteGenre
    }
  }
`

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
${BOOK_DETAILS}
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const myGenre = useQuery(MY_GENRE)
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }
  const [login] = useMutation(LOGIN, {
    onError: handleError
  })
  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
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
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  const errorNotification = () => errorMessage &&
  <div style={{ color: 'red' }}>
    {errorMessage}
  </div>
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      let bookTitle = subscriptionData.data.bookAdded.title
      window.alert(`${bookTitle} added`)
    }
  })

  if (!token) {
    return (
      <div>
        {errorNotification()}
        <h2>Login</h2>
        <LoginForm
          login={login}
          setToken={(token) => setToken(token)}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        <button onClick={logout}>logout</button>
      </div>
      {errorMessage &&
        <div style={{ color: 'red' }}>
          {errorMessage}
        </div>
      }

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

      <Recommended
        genreResult={myGenre}
        result={books}
        show={page === 'recommended'}
      />
    </div>
  )
}

export default App