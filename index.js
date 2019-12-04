const { ApolloServer, gql } = require('apollo-server')
const uuid = require('uuid/v1')
const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * It would be more sensible to assosiate book and the author by saving 
 * the author id instead of the name to the book.
 * For simplicity we however save the author name.
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: {
      name: 'Robert Martin',
      id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
      born: 1952
    },
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: {
      name: 'Robert Martin',
      id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
      born: 1963
    },
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  // {
  //   title: 'Refactoring, edition 2',
  //   published: 2018,
  //   author: 'Martin Fowler',
  //   id: "afa5de00-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring']
  // },
  // {
  //   title: 'Refactoring to patterns',
  //   published: 2008,
  //   author: 'Joshua Kerievsky',
  //   id: "afa5de01-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring', 'patterns']
  // },  
  // {
  //   title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
  //   published: 2012,
  //   author: 'Sandi Metz',
  //   id: "afa5de02-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring', 'design']
  // },
  // {
  //   title: 'Crime and punishment',
  //   published: 1866,
  //   author: 'Fyodor Dostoevsky',
  //   id: "afa5de03-344d-11e9-a414-719c6709cf3e",
  //   genres: ['classic', 'crime']
  // },
  // {
  //   title: 'The Demon',
  //   published: 1872,
  //   author: 'Fyodor Dostoevsky',
  //   id: "afa5de04-344d-11e9-a414-719c6709cf3e",
  //   genres: ['classic', 'revolution']
  // },
]

const typeDefs = gql`
  type Book {
    title: String!
    published: String!
    author: Author!
    id: ID!
    genres: [String]
  }

  type Author {
    name: String!
    id: ID!
    born: String
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    addAuthor(
      name: String!
      born: Int
    ): Author
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return books
      }
      else if (args.author && !args.genre) {
        return books.filter(b => b.author === args.author)
      }
      else if (!args.author && args.genre) {
        return books.filter(b => b.genres.includes(args.genre))
      }
      else {
        return books
          .filter(b => b.author === args.author)
          .filter(b => b.genres.includes(args.genre))
      }
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: (root) => books.filter(b => b.author === root.name).length
  },
  Mutation: {
    addBook: (root, args) => {
      console.log('author', args.author)
      if (authors.find(a => a.name !== args.author)) {
        const author = { name: args.author, id: uuid() }
        authors = authors.concat(author)
      }
      const bookAuthor = authors.find(a => a.name === args.author)
      const authorObj = { 
        name: bookAuthor.name,
        id: bookAuthor.id,
        born: bookAuthor.born
      }
      console.log('authorObj', authorObj)
      const book = { ...args, author: authorObj, id: uuid() }
      console.log('book', book)
      books = books.concat(book)
      return book
    },
    addAuthor: (root, args) => {
      const author = { ...args, id: uuid() }
      authors = authors.concat(author)
      return author
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      const updatedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
    } 
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
