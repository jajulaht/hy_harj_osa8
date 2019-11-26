import React, { useState } from 'react'
//import { useApolloClient } from '@apollo/react-hooks'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState('')

  if (!props.show) {
    return null
  }

  if (props.result.loading) {
    return <div>loading...</div>
  }

  const submit = async (e) => {
    e.preventDefault()
    await props.editAuthor({
      variables: { name, setBornTo }
    })

    setName('')
    setSetBornTo('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {props.result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            value={setBornTo}
            onChange={({ target }) => setSetBornTo(parseInt(target.value))}
          />
        </div>
        <button type='submit'>Update author</button>
      </form>
    </div>
  )
}

export default Authors