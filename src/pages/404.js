import Link from 'next/link'
import React from 'react'

const NotFoundPage = () => (
  <div>
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    <Link href={'/add'}>3333</Link>
  </div>
)

export default NotFoundPage
