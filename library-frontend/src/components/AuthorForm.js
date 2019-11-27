import React, { useState } from 'react'


const AuthorForm = (props) => {
  const [name, setName] = useState(props.result.data.allAuthors[0].name)
  const [setBornTo, setSetBornTo] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await props.editAuthor({
      variables: { name, setBornTo }
    })

    document.getElementById("selectAuthor").selectedIndex = 0
    setName(props.result.data.allAuthors[0].name)
    setSetBornTo('')
  }

return (
  <div>
    <h3>Set birthyear</h3>
    <form onSubmit={submit}>
      <div>
        <label>
          Select name
          <select id='selectAuthor' onChange={({ target }) => setName(target.value)}>
            {props.result.data.allAuthors.map(a =>
              <option key={a.name} value={a.name}>{a.name}</option>
            )}
          </select>
        </label>
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

      export default AuthorForm