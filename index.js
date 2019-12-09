require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.set('useFindAndModify', false)

MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// let authors = [
//   {
//     name: 'Robert Martin',
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821
//   },
//   { 
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   { 
//     name: 'Sandi Metz', // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

/*
 * It would be more sensible to assosiate book and the author by saving 
 * the author id instead of the name to the book.
 * For simplicity we however save the author name.
*/

// let books = [
//  {
//     title: 'Clean Code',
//     published: 2008,
//     author: {
//       name: 'Robert Martin',
//       id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//       born: 1952
//     },
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Agile software development',
//     published: 2002,
//     author: {
//       name: 'Robert Martin',
//       id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//       born: 1963
//     },
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ['agile', 'patterns', 'design']
//   },
//   {
//     title: 'Refactoring, edition 2',
//     published: 2018,
//     author: {
//       name: 'Martin Fowler',
//       id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//       born: 1963
//     },
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'patterns']
//   },  
//   {
//     title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//     published: 2012,
//     author: 'Sandi Metz',
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'design']
//   },
//   {
//     title: 'Crime and punishment',
//     published: 1866,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'crime']
//   },
//   {
//     title: 'The Demon',
//     published: 1872,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'revolution']
//   },
// ]

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
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log('args', args)
      if (!args.author && !args.genre) {
        return await Book.find({}).populate("author")
      }
      else if (args.author && !args.genre) {
        // todo
      }
      else if (!args.author && args.genre) {
        const resp = await Book
          .find({ genres: { $in: [args.genre] }})
          .populate("author")
        console.log('haku', resp)
        return resp // includes?
      }
      else {
        // todo
      }
    },
    allAuthors: () => Author.find({}),
  },
  Author: {
    bookCount: async root => {
      console.log('root', root)
      const searchedAuthor = await Author.findOne({ name: root.name })
      console.log('searchedAuthor', searchedAuthor)
      const countedBooks = await Book.collection.countDocuments({ author: searchedAuthor._id })
      console.log('count', countedBooks)
      return countedBooks
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      console.log('args', args)
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author, born: args.born })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id
      })
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      const authorObj = await Author.findOne({ _id: book.author })
      console.log('authorObj', authorObj)
      const returnedBook = {
        title: book.title,
        published: book.published,
        genres: book.genres,
        author: authorObj,
        id: book._id
      }
      console.log('returnedBook', returnedBook)
      return returnedBook
    },
    addAuthor: (root, args) => {
      const author = new Author({ ...args })
      return author.save()
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author.save()
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
