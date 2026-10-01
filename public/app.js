const form = document.getElementById('form')
const input = document.getElementById('url')
const tombol = document.getElementById('cari')
const pesan = document.getElementById('pesan')
const hasil = document.getElementById('hasil')
const galeri = document.getElementById('galeri')

const el = id => document.getElementById(id)
const tunggu = ms => new Promise(r => setTimeout(r, ms))

function tampilkanPesan(teks) {
  pesan.textContent = teks
  pesan.hidden = !teks
}

function linkUnduh(src, nama, ext) {
  return `/api/unduh?src=${encodeURIComponent(src)}&nama=${encodeURIComponent(nama)}&ext=${ext}`
}

async function unduhSemua(daftar) {
  for (const href of daftar) {
    const a = document.createElement('a')
    a.href = href
    document.body.appendChild(a)
    a.click()
    a.remove()
    await tunggu(700)
  }
}

function isiVideo(d, nama) {
  const hd = el('unduh-hd')
  const sd = el('unduh-sd')

  hd.hidden = !d.hd
  if (d.hd) hd.href = linkUnduh(d.hd, nama + '-hd', 'mp4')
  sd.hidden = false
  sd.textContent = d.hd ? 'Unduh kualitas biasa' : 'Unduh video'
  sd.href = linkUnduh(d.video, nama, 'mp4')
  el('unduh-semua').hidden = true
  galeri.hidden = true
}

function isiFoto(d, nama) {
  el('unduh-hd').hidden = true
  el('unduh-sd').hidden = true

  const links = d.gambar.map((src, i) => linkUnduh(src, `${nama}-${i + 1}`, 'jpg'))

  galeri.innerHTML = ''
  links.forEach((href, i) => {
    const a = document.createElement('a')
    a.href = href
    a.title = 'Unduh foto ' + (i + 1)
    const img = document.createElement('img')
    img.src = d.gambar[i]
    img.alt = 'Foto ' + (i + 1)
    img.loading = 'lazy'
    a.appendChild(img)
    galeri.appendChild(a)
  })
  galeri.hidden = false

  const semua = el('unduh-semua')
  semua.hidden = false
  semua.textContent = `Unduh ${links.length} foto`
  semua.onclick = () => unduhSemua(links)
}

function isiHasil(d) {
  const nama = d.penulis ? `${d.penulis}-tiktok` : 'tiktok'

  el('sampul').src = d.sampul
  el('sampul').alt = 'Sampul: ' + d.judul
  el('judul').textContent = d.judul
  el('penulis').textContent = d.penulis ? '@' + d.penulis : ''

  if (d.tipe === 'foto') isiFoto(d, nama)
  else isiVideo(d, nama)

  const mp3 = el('unduh-mp3')
  mp3.hidden = !d.musik
  if (d.musik) mp3.href = linkUnduh(d.musik, nama, 'mp3')

  hasil.hidden = false
}

form.addEventListener('submit', async e => {
  e.preventDefault()
  tampilkanPesan('')
  hasil.hidden = true
  tombol.disabled = true
  tombol.textContent = 'Mencari…'

  try {
    const r = await fetch('/api/cari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: input.value })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.pesan)
    isiHasil(data)
  } catch (err) {
    tampilkanPesan(err.message || 'Ada yang salah. Coba lagi.')
  } finally {
    tombol.disabled = false
    tombol.textContent = 'Cari video'
  }
})

input.addEventListener('focus', async () => {
  if (input.value || !navigator.clipboard?.readText) return
  try {
    const teks = await navigator.clipboard.readText()
    if (/tiktok\.com/.test(teks)) input.value = teks.trim()
  } catch {}
})
