import React, { useState } from 'react';
import { Filter } from 'nostr-tools';
import { fetchEvents } from '../util/util';
import Loading from '../elements/Loading';
import NostrCard from '../elements/NostrCard';
import { BsTrash } from 'react-icons/bs';
import './QueryPage.css';

export default function QueryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const kindsList = [
    { id: '1', name: 'note' },
    { id: '6', name: 'repost' },
    { id: '7', name: 'reaction' },
  ];

  const [kinds, setKinds] = useState('1');
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [limit, setLimit] = useState<null | number>(null);
  const [authors, setAuthors] = useState<string[]>([]);

  let authorsValue = authors.join('\n');

  function handleAuthorsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAuthors(e.target.value.split('\n'));
  }

  function query() {
    if (loading) {
      return;
    }

    console.log('query', kinds, since, until, limit, authors);
    let filter: Filter = {
      kinds: null,
      since: null,
      until: null,
      limit: null,
      authors: null,
    };
    if (kinds && !Number.isNaN(Number(kinds))) {
      filter.kinds = [Number(kinds)];
    }
    if (since) {
      filter.since = new Date(since).getTime() / 1000;
    }
    if (until) {
      filter.until = new Date(until).getTime() / 1000;
    }
    if (limit) {
      filter.limit = limit;
    }
    if (authors.length) {
      filter.authors = authors;
    }
    console.log('filter', filter);

    setLoading(true);
    fetchEvents([filter])
      .then((data: any) => {
        console.log('data', data);
        setData(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function renderRelayTests() {
    if (loading) return <Loading />;

    if (!data.length) {
      return <div>No Data</div>;
    }

    let divs = [];
    for (let i = 0; i < data.length; i++) {
      divs.push(<NostrCard key={i} data={data[i]} />);
    }

    return divs;
  }

  return (
    <div className="query-page">
      <div className="query-page-header">
        <div className="query-page-title">Query</div>
      </div>
      <div className="filter-section">
        <div className="filter-title">Kinds</div>
        <select
          className="filter-select"
          value={kinds}
          onChange={(e) => setKinds(e.target.value)}
        >
          {kindsList.map((kind) => (
            <option key={kind.id} value={kind.id}>
              {kind.id} {kind.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-input">
        <div className="filter-section">
          <div className="filter-title">
            Since
            <BsTrash
              className="filter-trash-icon"
              onClick={() => {
                setSince('');
              }}
            />
          </div>
          <span>
            <label>from:  </label>
            <input
              type="date"
              value={since}
              onChange={(e) => setSince(e.target.value)}
            />
          </span>
        </div>

        <div className="filter-section">
          <div className="filter-title">
            Until
            <BsTrash
              className="filter-trash-icon"
              onClick={() => {
                setUntil('');
              }}
            />
          </div>
          <span>
            <label>to:  </label>
            <input
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </span>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-title">Authors</div>
        <textarea
          value={authorsValue}
          onChange={handleAuthorsChange}
        />
      </div>

      <div className="filter-section">
        <button className="query-button" onClick={query}>
          Query
        </button>
      </div>

      <div className="query-results">{renderRelayTests()}</div>
    </div>
  );
}
