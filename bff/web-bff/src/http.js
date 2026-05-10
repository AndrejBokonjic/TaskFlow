// bff/web-bff/src/http.js
// VZOREC: Odklopnik (Circuit Breaker) - Zanesljivost
// Uporablja knjižnico 'opossum' za zaščito pred kaskadnimi okvarami.
// Ko storitev večkrat zaporedoma ne odgovori, odklopnik "odpre krog" in
// takoj vrne fallback odgovor namesto čakanja na timeout.

const axios = require('axios');
const CircuitBreaker = require('opossum');

const USERS_URL = process.env.USERS_URL || 'http://localhost:8000';
const PROJECTS_URL = process.env.PROJECTS_URL || 'http://localhost:3000';
const TASKS_URL = process.env.TASKS_URL || 'http://localhost:5001';

// Circuit breaker možnosti
const CB_OPTIONS = {
  timeout: 5000,          // po 5s brez odgovora = napaka
  errorThresholdPercentage: 50,  // odpre krog po 50% napakah
  resetTimeout: 15000,    // po 15s poskusi znova (half-open)
  volumeThreshold: 3,     // vsaj 3 klici pred odločitvijo
};

// Ustvari axios client z circuit breaker ovitkom
function createClient(baseURL, name) {
  const instance = axios.create({ baseURL, timeout: 5000 });

  // Generična funkcija za HTTP klic - opossum ovije to
  const httpCall = async ({ method, url, data, params }) => {
    return instance.request({ method, url, data, params });
  };

  const breaker = new CircuitBreaker(httpCall, CB_OPTIONS);

  // Logiranje stanj odklopnika
  breaker.on('open', () =>
    console.warn(`[CircuitBreaker] ${name}: ODPRT - storitev ni dostopna`)
  );
  breaker.on('halfOpen', () =>
    console.info(`[CircuitBreaker] ${name}: NAPOL ODPRT - testira obnovitev`)
  );
  breaker.on('close', () =>
    console.info(`[CircuitBreaker] ${name}: ZAPRT - storitev deluje normalno`)
  );
  breaker.on('fallback', () =>
    console.warn(`[CircuitBreaker] ${name}: FALLBACK aktiviran`)
  );

  // Fallback: vrni prazno stanje namesto napake
  breaker.fallback(({ method, url }) => {
    console.warn(`[CircuitBreaker] ${name}: fallback za ${method?.toUpperCase()} ${url}`);
    return {
      data: method === 'get' && url.includes('?') ? [] :
            method === 'get' ? null : null,
      status: 503,
      _fallback: true,
    };
  });

  // Proxy objekt ki izgleda kot axios instance
  return {
    get: (url, config = {}) => breaker.fire({ method: 'get', url, params: config.params }),
    post: (url, data, config = {}) => breaker.fire({ method: 'post', url, data }),
    put: (url, data, config = {}) => breaker.fire({ method: 'put', url, data }),
    delete: (url, config = {}) => breaker.fire({ method: 'delete', url }),
    patch: (url, data, config = {}) => breaker.fire({ method: 'patch', url, data }),
    _breaker: breaker,
    _name: name,
  };
}

const clients = {
  users: createClient(USERS_URL, 'uporabniki'),
  projects: createClient(PROJECTS_URL, 'projekti'),
  tasks: createClient(TASKS_URL, 'naloge'),
};

// Health endpoint podatki o odklopnikih
const getBreakerStats = () => ({
  uporabniki: clients.users._breaker.stats,
  projekti: clients.projects._breaker.stats,
  naloge: clients.tasks._breaker.stats,
});

// Propagira napake z ustrezno HTTP kodo
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.detail || err.response?.data?.error || err.message;
    res.status(status).json({ error: message });
  }
};

module.exports = { clients, handle, getBreakerStats };
