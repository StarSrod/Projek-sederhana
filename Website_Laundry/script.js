const WA_NUMBER = '628138987329';

// Data harga pembayaran (info statis, sesuaikan dengan akun asli kamu)
const PAYMENT_INFO = {
  QRIS: {
    icon: 'ti ti-qrcode',
    text: 'Scan QRIS pada saat pakaian diantar/diambil oleh kurir kami, atau tunjukkan QRIS di outlet.'
  },
  DANA: {
    icon: 'ti ti-wallet',
    text: 'Transfer ke DANA 0813-8987-329 a/n OKE LAUNDRY HOUSE, lalu kirim bukti transfer via WhatsApp.'
  },
  SeaBank: {
    icon: 'ti ti-building-bank',
    text: 'Transfer ke SeaBank 901234567890 a/n OKE LAUNDRY HOUSE, lalu kirim bukti transfer via WhatsApp.'
  }
};

let metodeAktif = 'QRIS';

// ── Klik kartu layanan -> isi otomatis form & scroll ke form ──
function pilihLayanan(btn) {
  const card = btn.closest('.layanan-card');
  const layanan = card.dataset.layanan;
  const harga = card.dataset.harga;

  const select = document.getElementById('f-layanan');

  let matched = false;
  for (const opt of select.options) {
    if (opt.textContent.trim() === layanan) {
      opt.selected = true;
      matched = true;
      break;
    }
  }

  if (!matched) {
    select.value = '';
  }

  select.dataset.hargaManual = harga;
  select.dataset.labelManual = layanan;

  hitungEstimasi();

  document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Saat dropdown layanan diubah manual oleh user ──
function updateLayananManual() {
  const select = document.getElementById('f-layanan');

  delete select.dataset.hargaManual;
  delete select.dataset.labelManual;

  hitungEstimasi();
}

// ── Hitung estimasi otomatis ──
function hitungEstimasi() {
  const select = document.getElementById('f-layanan');
  const opt = select.options[select.selectedIndex];

  const labelLayanan = select.dataset.labelManual || (opt ? opt.textContent : '');
  const harga = parseInt(select.dataset.hargaManual || (opt ? opt.dataset.harga : 0)) || 0;

  const jumlahInput = document.getElementById('f-jumlah');
  const jumlah = parseFloat(jumlahInput.value) || 0;

  const total = harga * jumlah;

  document.getElementById('sum-layanan').textContent = labelLayanan || 'Belum dipilih';
  document.getElementById('sum-jumlah').textContent = jumlah + ' kg';
  document.getElementById('sum-harga-satuan').textContent = formatRupiah(harga) + '/kg';
  document.getElementById('sum-total').textContent = formatRupiah(total);
}

function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// ── Pilih metode pembayaran ──
function pilihMetode(btn) {
  document.querySelectorAll('.pay-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  metodeAktif = btn.dataset.metode;
  const info = PAYMENT_INFO[metodeAktif];

  document.getElementById('pay-method-label').textContent = metodeAktif;
  document.getElementById('pay-detail').textContent = info.text;

  const iconEl = document.querySelector('.payment-info-head i');
  iconEl.className = info.icon;
}

// ── Kirim WA dari pop up modal ──
function sendWA() {
  const nama = document.getElementById('m-nama').value.trim() || 'Pelanggan';
  const layanan = document.getElementById('m-layanan').value || 'belum dipilih';

  const pesan =
    'Halo OKE LAUNDRY HOUSE! 👋\n' +
    'Nama saya *' + nama + '*\n' +
    'Saya ingin memesan layanan: *' + layanan + '*\n' +
    'Mohon infonya ya, terima kasih!';

  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(pesan), '_blank');
}

// ── Kirim order dari form utama (sudah termasuk estimasi & pembayaran) ──
function orderViaForm() {
  const nama = document.getElementById('f-nama').value.trim() || 'Pelanggan';
  const hp = document.getElementById('f-hp').value.trim();
  const catatan = document.getElementById('f-catatan').value.trim();

  const layanan = document.getElementById('sum-layanan').textContent;
  const jumlah = document.getElementById('sum-jumlah').textContent;
  const total = document.getElementById('sum-total').textContent;

  let pesan = 'Halo OKE LAUNDRY HOUSE! 👋\n';
  pesan += 'Nama: *' + nama + '*\n';
  if (hp) pesan += 'No HP: ' + hp + '\n';
  pesan += 'Layanan: *' + layanan + '*\n';
  pesan += 'Jumlah: ' + jumlah + '\n';
  pesan += 'Estimasi total: *' + total + '*\n';
  pesan += 'Metode pembayaran: *' + metodeAktif + '*\n';
  if (catatan) pesan += 'Catatan: ' + catatan;

  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(pesan), '_blank');
}

// ── Tutup modal kalau klik di luar modal ──
function closeOverlayOnBackgroundClick() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  overlay.addEventListener('click', function (e) {
    if (e.target === this) {
      this.classList.remove('show');
    }
  });
}

// ── Animasi muncul saat scroll ──
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll('.fade-up').forEach((el, index) => {
    el.style.transitionDelay = `${index * 80}ms`;
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  closeOverlayOnBackgroundClick();
  initScrollReveal();
  hitungEstimasi();
});