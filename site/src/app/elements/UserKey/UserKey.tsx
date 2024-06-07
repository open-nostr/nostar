import React, {useEffect, useState} from "react"
import {generateSecretKey, getPublicKey} from 'nostr-tools'
import {bytesToHex} from '@noble/hashes/utils'
import {shortAddr} from "../../util/util"
import './index.css'
import {NOSTR_PRIVATE_KEY} from "../../util/consts"
import Modal from '../../modals/Modal'

export default function UserKey (): React.ReactElement {
  const [privateKey, setPrivateKey] = useState(null)
  let pubkey = privateKey ? getPublicKey(privateKey) : null

  const [showFullKey, setShowFullKey] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let key = localStorage.getItem(NOSTR_PRIVATE_KEY)
    if (key) {
      setPrivateKey(key)
    } else {
      // generate a new key and save it to local storage if it doesn't exist
      let sk = generateSecretKey()
      let skHex = bytesToHex(sk)
      localStorage.setItem(NOSTR_PRIVATE_KEY, skHex)
      setPrivateKey(skHex)
    }
  }, [])

  function toGenerateNewKey () {
    // generate a new key and save it to local storage
    let sk = generateSecretKey()
    let skHex = bytesToHex(sk)
    localStorage.setItem(NOSTR_PRIVATE_KEY, skHex)
    setPrivateKey(skHex)
    // close the modal
    setOpen(false)
  }

  if (!privateKey) {
    return null
  }

  return (
    <div
      className="user-key"
    >
      <div>
        <span
          className="user-key-title"
          title="show full key"
          onClick={
            (e) => {
              e.stopPropagation()
              setShowFullKey(v => !v)
            }
          }
        >privateKey:</span>
        <span>
          {
            showFullKey ? privateKey : shortAddr(privateKey, 4)
          }
        </span>
      </div>
      <div>
        <span
          className="user-key-title"
          title="show full key"
          onClick={
            (e) => {
              e.stopPropagation()
              setShowFullKey(v => !v)
            }
          }
        >pubkey:</span>
        <span>
          {
            showFullKey ? pubkey : shortAddr(pubkey, 4)
          }
        </span>
      </div>

      <div style={{
        marginTop: '10px'
      }}>
        <button
          className="bounty-modal-token bounty"
          onClick={() => setOpen(true)}
        >Generate New Key</button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        header="Generate New Key"
        showBtnCancel={true}
        onBtnOk={toGenerateNewKey}
        btnOkTitle="Confirm"
        children={
          (
            <>
              <div>Are you sure to generate a new key?</div>
              <div style={{
                color: 'red'
              }}>This will overwrite the current key!</div>
            </>
          )
        }
      />
    </div>
  )
}
