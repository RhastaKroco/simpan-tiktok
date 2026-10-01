import express from 'express'
import axios from 'axios'
import { Readable } from 'node:stream'

const app = express()
const PORT = process.env.PORT || 3000

const hits = new Map()
const BATAS = 20
const JENDELA = 60_000

function terlaluSering(ip) {
  const sekarang = Date.now()
  const catatan = (hits.get(ip) || []).filter(t => sekarang - t < JENDELA)
  catatan.push(sekarang)
  hits.set(ip, catatan)
  return catatan.length > BATAS
}

function linkTikTok(teks) {
  try {
    const u = new URL(teks)
    return /(^|\.)tiktok\.com$/.test(u.hostname) ? u.href : null
  } catch {
    return null
  }
}

function hostDiizinkan(src) {
  try {
    const { hostname, protocol } = new URL(src)
    return protocol === 'https:' && /(tikwm\.com|tiktokcdn[\w-]*\.com|tiktokv\.(com|us))$/.test(hostname)
  } catch {
    return false
  }
}

app.use(express.json())
app.use(express.static('public'))

app.post('/api/cari', async (req, res) => {
  if (terlaluSering(req.ip)) {
    return res.status(429).json({ pesan: 'Terlalu banyak permintaan. Tunggu semenit lalu coba lagi.' })
  }

  const link = linkTikTok((req.body?.url || '').trim())
  if (!link) {
    return res.status(400).json({ pesan: 'Itu bukan link TikTok. Salin dari tombol Bagikan di aplikasinya.' })
  }

  try {
    const { data: json } = await axios.get('https://www.tikwm.com/api/', {
      params: { url: link, hd: 1 },
      timeout: 15000
    })

    const d = json?.data
    if (!d) {
      return res.status(404).json({ pesan: 'Videonya tidak ketemu. Mungkin sudah dihapus atau akunnya privat.' })
    }

    const abs = p => (p && p.startsWith('/') ? 'https://www.tikwm.com' + p : p)
    const gambar = (d.images || []).map(abs)

    res.json({
      tipe: gambar.length ? 'foto' : 'video',
      judul: d.title || 'Tanpa judul',
      penulis: d.author?.unique_id || '',
      sampul: abs(d.cover),
      video: abs(d.play),
      hd: abs(d.hdplay),
      musik: abs(d.music),
      gambar
    })
  } catch {
    res.status(502).json({ pesan: 'Layanan sumber sedang tidak bisa dihubungi. Coba lagi sebentar lagi.' })
  }
})

app.get('/api/unduh', async (req, res) => {
  const { src, nama = 'video', ext = 'mp4' } = req.query
  if (!hostDiizinkan(src)) return res.status(400).send('Sumber tidak diizinkan')

  try {
    const r = await fetch(src)
    if (!r.ok || !r.body) throw new Error('gagal')

    const aman = String(nama).replace(/[^\w-]+/g, '_').slice(0, 60) || 'video'
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream')
    const akhiran = ['mp3', 'jpg'].includes(ext) ? ext : 'mp4'
    res.setHeader('Content-Disposition', `attachment; filename="${aman}.${akhiran}"`)
    Readable.fromWeb(r.body).pipe(res)
  } catch {
    res.status(502).send('Gagal mengambil file')
  }
})

app.listen(PORT, () => console.log(`Jalan di http://localhost:${PORT}`))
