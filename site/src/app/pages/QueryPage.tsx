import {useState} from "react"
import { Filter } from "nostr-tools"
import {fetchEvents} from "../util/util"
import Loading from '../elements/Loading';
import NostrCard from '../elements/NostrCard';
import { BsTrash } from "react-icons/bs";

export default function Query () {

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  const kindsList = [
    {id: '1', name: 'note'},
    {id: '6', name: 'repost'},
    {id: '7', name: 'reaction'},
  ]

  const [kinds, setKinds] = useState('1')
  const [since, setSince] = useState('')
  const [until, setUntil] = useState('')
  const [limit, setLimit] = useState<null | number>(null)
  const [authors, setAuthors] = useState<string[]>([])

  let authorsValue = authors.join('\n')

  function handleAuthorsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAuthors(e.target.value.split('\n'))
  }

  function query () {
    if (loading) {
      return
    }

    console.log('query', kinds, since, until, limit, authors)
    let filter: Filter = {
      kinds: null,
      since: null,
      until: null,
      limit: null,
      authors: null,
    }
    if (kinds && !Number.isNaN(Number(kinds))) {
      filter.kinds = [Number(kinds)]
    }
    if (since) {
      filter.since = (new Date(since).getTime() / 1000)
    }
    if (until) {
      filter.until = (new Date(until).getTime() / 1000)
    }
    if (limit) {
      filter.limit = limit
    }
    if (authors.length) {
      filter.authors = authors
    }
    console.log('filter', filter)

    setLoading(true)
    fetchEvents([filter]).then((data:any) => {
      console.log('data', data)
      setData(data)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderRelayTests() {
    if (loading) return (<Loading />);

    if (!data.length) {
      return <div>No Data</div>
    }

    let divs = [];
    for (let i = 0; i < data.length; i++) {
      divs.push(
        <NostrCard key={i} data={data[i]} />
      )
    }

    return divs
  }

  return (
    <div style={{
      padding: '20px',
    }}>
      <div>
        <h4 className="filter-title">Kinds</h4>
        <select className="filter-select home-filter"
          value={kinds}
          onChange={(e) => setKinds(e.target.value)}
        >
          {kindsList.map((kind) => (
            <option key={kind.id} value={kind.id}>{kind.id} {kind.name}</option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
      }}>
        <div>
          <h4 className="filter-title"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
          >
            Since
            <BsTrash
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              setSince('')
            }}
            />
          </h4>

          <span>
            <label>from:</label>
            <input
             style={{
              outline: 'none',
            }}
            type="date" value={since} onChange={
              (e) => setSince(e.target.value)
            } />
          </span>
        </div>

        <div>
          <h4
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
           className="filter-title">Until
          <BsTrash
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              setUntil('')
            }}
            />
          </h4>

          <span>
            <label>to:</label>
            <input
             style={{
              outline: 'none',
            }}
            type="date" value={until} onChange={
              (e) => setUntil(e.target.value)
            } />
          </span>
        </div>
      </div>

      {/* <div>
        <h4 className="filter-title">Limit</h4>
        <input type="number" value={limit || ''} min={0} onChange={
          (e) => setLimit(e.target.value ? parseInt(e.target.value) : null)
        } />
      </div> */}

      <div>
        <h4 className="filter-title">Authors</h4>
        <textarea
        style={{
          width: '400px',
          height: '100px',
          border: '1px solid #ccc',
          fontSize: '12px',
          outline: 'none',
        }}
        value={authorsValue} onChange={handleAuthorsChange} />
      </div>

      <div>
        <button onClick={query}>Query</button>
      </div>

      <div
      style={{
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      >
        {renderRelayTests()}
      </div>
    </div>
  )
}

