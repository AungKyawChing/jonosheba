/**
 * Dynamic Universal Modal Box
 * এটি রান করলে অটোমেটিক CSS এবং Modal HTML তৈরি করবে।
 */

(function initModal() {
  // ১. CSS ইনজেকশন (আলাদা ফাইল লাগবে না)
  const style = document.createElement('style');
  style.innerHTML = `
      .modal-overlay {
          display: none; position: fixed; z-index: 9999;
          left: 0; top: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
      }
      .modal-box {
          background: #fff; margin: 15vh auto; padding: 25px;
          width: 320px; border-radius: 12px; text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          font-family: 'Segoe UI', Arial, sans-serif;
      }
      .modal-box h3 { margin-top: 0; color: #333; font-size: 1.2rem; }
      .modal-box p { color: #666; font-size: 0.9rem; margin-bottom: 15px; }
      .modal-box input {
          width: 100%; padding: 12px; margin-bottom: 20px;
          border: 2px solid #eee; border-radius: 8px;
          box-sizing: border-box; font-size: 16px; transition: 0.3s;
      }
      .modal-box input:focus { border-color: #28a745; outline: none; }
      .btn-group { display: flex; gap: 10px; justify-content: center; }
      .btn-modal {
          padding: 10px 20px; cursor: pointer; border: none;
          border-radius: 8px; font-weight: bold; min-width: 100px; transition: 0.3s;
      }
      #modalConfirmBtn { background: #28a745; color: #fff; }
      #modalConfirmBtn:disabled { background: #6c757d; cursor: not-allowed; }
      .btn-cancel { background: #f8f9fa; color: #333; border: 1px solid #ddd; }
  `;
  document.head.appendChild(style);

  // ২. HTML এলিমেন্ট তৈরি
  const modalHTML = `
      <div id="universalModal" class="modal-overlay">
          <div class="modal-box">
              <h3>Confirm Action</h3>
              <p>আপনার Secret Code দিন</p>
              <input type="password" id="modalSecretCode" placeholder="Secret Code">
              <div class="btn-group">
                  <button id="modalConfirmBtn" class="btn-modal">Confirm</button>
                  <button id="modalCancelBtn" class="btn-modal btn-cancel">Cancel</button>
              </div>
          </div>
      </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // ৩. ক্লোজ ইভেন্ট
  document.getElementById('modalCancelBtn').onclick = () => {
    document.getElementById('universalModal').style.display = 'none';
  };
})();

/**
* মডাল ওপেন এবং কলব্যাক হ্যান্ডলার
*/
async function openModal(callback) {
  const modal = document.getElementById('universalModal');
  const btn = document.getElementById('modalConfirmBtn');
  const secretInput = document.getElementById('modalSecretCode');

  modal.style.display = 'block';
  secretInput.focus();

  btn.onclick = async () => {
    const secretCode = secretInput.value;
    if (!secretCode) {
      alert("দয়া করে সিক্রেট কোডটি দিন!");
      return;
    }

    // বাটন ফ্রিজ
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
      // মূল পোস্ট রিকোয়েস্ট রান হবে (secretCode সহ)
      await callback(secretCode);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      // ৩ সেকেন্ড ডিলে করে বাটন রিলিজ এবং মডাল ক্লোজ
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "Confirm";
        modal.style.display = 'none';
        // সিক্রেট কোড ফিল্ড মুছছি না যাতে পরের বার ইউজারকে টাইপ করতে না হয়
      }, 3000);
    }
  };
}