import './style.css'

import { Capacitor } from '@capacitor/core'
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera'

import { Geolocation } from '@capacitor/geolocation'
import { Network } from '@capacitor/network'
import { LocalNotifications } from '@capacitor/local-notifications'

import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from 'firebase/auth'

import { auth } from './firebase.js'

const app = document.querySelector('#app')

const googleProvider = new GoogleAuthProvider()


function renderAuthLoading() {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#334155;font-size:16px;">
      <div style="text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">🎓</div>
        <div>Đang kiểm tra đăng nhập...</div>
      </div>
    </div>
  `
}

function renderLogin() {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f1f5f9;box-sizing:border-box;">
      <div style="width:min(420px,100%);background:white;border-radius:20px;padding:32px;box-shadow:0 12px 35px rgba(15,23,42,.12);text-align:center;">
        <div style="font-size:48px;margin-bottom:10px;">🎓</div>

        <h1>VKU Interview Survey</h1>

        <p style="color:#64748b;line-height:1.6;margin-bottom:24px;">
          Đăng nhập bằng Google để thực hiện khảo sát.
        </p>

        <button
          id="googleLoginBtn"
          class="primary-btn google-login-btn"
          type="button"
          style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style="width:20px;height:20px;"
          />

          <span>Đăng nhập bằng Google</span>
        </button>
      </div>
    </div>
  `

  const button = document.querySelector('#googleLoginBtn')

  if (button) {
    button.addEventListener(
      'click',
      loginWithGoogle
    )
  }
}

async function loginWithGoogle() {
  try {
    console.log('🔵 Đang đăng nhập Google...')

    await setPersistence(auth, browserLocalPersistence)

    const provider = new GoogleAuthProvider()

    const result = await signInWithPopup(auth, provider)

    console.log('✅ Google Login Success:', result.user.email)

  } catch (error) {
    console.error('❌ Google Login Error:', error)

    if (error.code === 'auth/popup-blocked') {
      alert('Trình duyệt đã chặn cửa sổ đăng nhập Google.')
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log('Người dùng đóng cửa sổ đăng nhập.')
    } else {
      alert('Đăng nhập Google thất bại: ' + error.message)
    }
  }
}

async function logout() {

  try {

    await signOut(auth)

    currentUser = null

    console.log(
      'Đã đăng xuất'
    )

  } catch (error) {

    console.error(
      'Logout Error:',
      error
    )

    alert(
      'Không thể đăng xuất.'
    )
  }
}

function getUserHTML() {

  if (!currentUser) {
    return ''
  }

  const photo =
    currentUser.photoURL
      ? `
        <img
          src="${currentUser.photoURL}"
          alt="Avatar"
          style="
            width:36px;
            height:36px;
            border-radius:50%;
            object-fit:cover;
          "
        >
      `
      : '👤'

  return `

    <div
      style="
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
        margin-top:10px;
      "
    >

      ${photo}

      <span style="font-size:14px;">
        ${
          currentUser.displayName ||
          currentUser.email ||
          'Người dùng'
        }
      </span>

      <button
        id="logoutBtn"
        type="button"
        class="secondary-btn"
      >
        Đăng xuất
      </button>

    </div>

  `
}


// ==========================================
// GOOGLE APPS SCRIPT API
// ==========================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbyGEe5-EXSm2QilztXZFnI7Xe32i-jwPB5dOdok7jaThaHIS0r_5dSItIE_DMgMxdm-/exec'


// ==========================================
// INDEXEDDB
// ==========================================

const DB_NAME =
  'vkuInterviewDB'

const STORE_NAME =
  'surveys'

const DB_VERSION =
  2


// Dữ liệu tạm của form
let surveyData = {}


// ==========================================
// FIREBASE AUTH STATE
// ==========================================

renderAuthLoading()

let currentUser = null
let authReady = false

async function initFirebaseAuth() {
  console.log('🔐 Đang khởi tạo Firebase Auth...')

  renderAuthLoading()

  try {
    await setPersistence(auth, browserLocalPersistence)
    console.log('✅ Firebase persistence OK')
  } catch (error) {
    console.error('❌ Firebase persistence error:', error)
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user
    authReady = true

    console.log(
      '🔐 Auth state:',
      user ? `Đã đăng nhập: ${user.email}` : 'Chưa đăng nhập'
    )

    if (user) {
      renderHome()
    } else {
      renderLogin()
    }
  })
}

initFirebaseAuth()



// ==========================================
// LẤY THỐNG KÊ
// ==========================================

async function getStatistics() {

  try {

    const response =
      await fetch(
        API_URL,
        {
          method: 'GET',
          cache: 'no-store'
        }
      )

    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      )
    }

    const result =
      await response.json()

    console.log(
      '📊 Statistics API:',
      result
    )

    if (!result.success) {

      throw new Error(
        result.message ||
        'Không thể lấy thống kê'
      )
    }

    if (!result.statistics) {

      throw new Error(
        'API không trả về statistics'
      )
    }

    return {

      total:
        Number(
          result.statistics.total
        ) || 0,

      interviewed:
        Number(
          result.statistics.interviewed
        ) || 0,

      notInterviewed:
        Number(
          result.statistics.notInterviewed
        ) || 0,

      lookingForJob:
        Number(
          result.statistics.lookingForJob
        ) || 0

    }

  } catch (error) {

    console.error(
      '❌ Lỗi lấy thống kê:',
      error
    )

    return {

      total: '--',

      interviewed: '--',

      notInterviewed: '--',

      lookingForJob: '--'

    }
  }
}


// ==========================================
// MỞ DATABASE
// ==========================================

function openDatabase() {

  return new Promise(
    (resolve, reject) => {

      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        )

      request.onupgradeneeded =
        () => {

          const db =
            request.result

          if (
            !db.objectStoreNames
              .contains(STORE_NAME)
          ) {

            db.createObjectStore(
              STORE_NAME,
              {
                keyPath: 'id'
              }
            )
          }
        }

      request.onsuccess =
        () => {

          resolve(
            request.result
          )
        }

      request.onerror =
        () => {

          reject(
            request.error
          )
        }
    }
  )
}


// ==========================================
// LƯU KHẢO SÁT
// ==========================================

async function saveSurvey(data) {

  const db =
    await openDatabase()

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )

      const store =
        transaction.objectStore(
          STORE_NAME
        )

      const request =
        store.put(data)

      request.onsuccess =
        () => {

          resolve()
        }

      request.onerror =
        () => {

          reject(
            request.error
          )
        }
    }
  )
}


// ==========================================
// LẤY TẤT CẢ KHẢO SÁT
// ==========================================

async function getAllSurveys() {

  const db =
    await openDatabase()

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          STORE_NAME,
          'readonly'
        )

      const store =
        transaction.objectStore(
          STORE_NAME
        )

      const request =
        store.getAll()

      request.onsuccess =
        () => {

          resolve(
            request.result || []
          )
        }

      request.onerror =
        () => {

          reject(
            request.error
          )
        }
    }
  )
}


// ==========================================
// NETWORK STATUS
// ==========================================

function getNetworkStatusHTML() {

  if (navigator.onLine) {

    return `

      <span class="network-status online">
        ● Online
      </span>

    `
  }

  return `

    <span class="network-status offline">
      ● Offline
    </span>

  `
}


// ==========================================
// HOME
// ==========================================

async function renderHome() {

  const statistics =
    await getStatistics()

  app.innerHTML = `

    <div class="home-container">

      <header class="home-header">

        <div class="home-header-content">

          <h1>
            VKU Interview Survey
          </h1>

          <p>
            Khảo sát tình trạng phỏng vấn
            và nhu cầu việc làm của sinh viên
          </p>

          ${getNetworkStatusHTML()}

          ${getUserHTML()}

        </div>

      </header>


      <main class="home-content">

        <section class="welcome-section">

          <h2>
            Khảo sát việc làm sinh viên
          </h2>

          <p>
            Hãy chia sẻ thông tin về quá trình
            phỏng vấn và nhu cầu việc làm của bạn.
          </p>

        </section>


        <section class="statistics-section">

          <h2>
            📊 Thống kê khảo sát
          </h2>


          <div class="statistics-grid">


            <div class="stat-card">

              <div class="stat-number">
                ${statistics.total}
              </div>

              <div class="stat-label">
                Sinh viên đã khảo sát
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-number">
                ${statistics.interviewed}
              </div>

              <div class="stat-label">
                Đã từng phỏng vấn
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-number">
                ${statistics.notInterviewed}
              </div>

              <div class="stat-label">
                Chưa từng phỏng vấn
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-number">
                ${statistics.lookingForJob}
              </div>

              <div class="stat-label">
                Đang tìm việc
              </div>

            </div>


          </div>

        </section>


        <section class="home-action">

          <button
            id="startSurveyBtn"
            class="primary-btn"
          >
            📋 Thực hiện khảo sát
          </button>

        </section>


      </main>

    </div>

  `


  const startButton =
    document.querySelector(
      '#startSurveyBtn'
    )

  if (startButton) {

    startButton.addEventListener(
      'click',
      renderSurvey
    )
  }


  const logoutBtn =
    document.querySelector(
      '#logoutBtn'
    )

  if (logoutBtn) {

    logoutBtn.addEventListener(
      'click',
      logout
    )
  }
}


// ==========================================
// RENDER FORM
// ==========================================

function renderSurvey() {

  app.innerHTML = `

    <div class="app-container">


      <header class="app-header">

        <div>

          <h1>
            VKU Interview Survey
          </h1>

          <p>
            Khảo sát tình trạng phỏng vấn
            và nhu cầu việc làm
          </p>

        </div>

        ${getNetworkStatusHTML()}

      </header>


      <main class="content">

        <form id="surveyForm">


          <!-- ================================
               1. THÔNG TIN SINH VIÊN
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                1. Thông tin sinh viên
              </h2>

              <p>
                Vui lòng cung cấp thông tin cơ bản
              </p>

            </div>


            <div class="form-group">

              <label for="fullName">

                Họ và tên

                <span class="required">
                  *
                </span>

              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                required
              />

            </div>


            <div class="form-group">

              <label for="studentId">

                MSSV

                <span class="required">
                  *
                </span>

              </label>

              <input
                id="studentId"
                type="text"
                placeholder="Nhập mã số sinh viên"
                required
              />

            </div>


            <div class="form-group">

              <label for="major">

                Ngành

                <span class="required">
                  *
                </span>

              </label>

              <select
                id="major"
                required
              >

                <option value="">
                  -- Chọn ngành --
                </option>

                <option value="Công nghệ thông tin">
                  Công nghệ thông tin
                </option>

                <option value="Kỹ thuật máy tính">
                  Kỹ thuật máy tính
                </option>

                <option value="Trí tuệ nhân tạo">
                  Trí tuệ nhân tạo
                </option>

                <option value="Kinh doanh số">
                  Kinh doanh số
                </option>

                <option value="Thương mại điện tử">
                  Thương mại điện tử
                </option>

                <option value="Khác">
                  Khác
                </option>

              </select>

            </div>


            <div class="form-group">

              <label for="year">

                Khóa

                <span class="required">
                  *
                </span>

              </label>

              <select
                id="year"
                required
              >

                <option value="">
                  -- Chọn khóa --
                </option>

                <option value="2022">
                  2022
                </option>

                <option value="2023">
                  2023
                </option>

                <option value="2024">
                  2024
                </option>

                <option value="2025">
                  2025
                </option>

                <option value="2026">
                  2026
                </option>

              </select>

            </div>


            <div class="form-group">

              <label>
                Giới tính
              </label>

              <div class="radio-group">

                <label>

                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                  />

                  Nam

                </label>


                <label>

                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                  />

                  Nữ

                </label>


                <label>

                  <input
                    type="radio"
                    name="gender"
                    value="Khác"
                  />

                  Khác

                </label>

              </div>

            </div>

          </section>


          <!-- ================================
               2. TÌNH TRẠNG PHỎNG VẤN
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                2. Tình trạng phỏng vấn
              </h2>

              <p>
                Cho biết tình trạng phỏng vấn của bạn
              </p>

            </div>


            <div class="form-group">

              <label>

                Bạn đã từng tham gia phỏng vấn chưa?

                <span class="required">
                  *
                </span>

              </label>


              <div class="radio-group">

                <label>

                  <input
                    type="radio"
                    name="interviewed"
                    value="Có"
                    required
                  />

                  Đã từng phỏng vấn

                </label>


                <label>

                  <input
                    type="radio"
                    name="interviewed"
                    value="Chưa"
                  />

                  Chưa từng phỏng vấn

                </label>

              </div>

            </div>


            <div
              id="interviewSection"
              style="display:none;"
            >

              <div class="form-group">

                <label for="interviewCount">

                  Số lần phỏng vấn

                </label>

                <input
                  id="interviewCount"
                  type="number"
                  min="1"
                  placeholder="Ví dụ: 2"
                />

              </div>


              <div class="form-group">

                <label for="company">

                  Công ty

                </label>

                <input
                  id="company"
                  type="text"
                  placeholder="Tên công ty"
                />

              </div>


              <div class="form-group">

                <label for="position">

                  Vị trí ứng tuyển

                </label>

                <input
                  id="position"
                  type="text"
                  placeholder="Ví dụ: Frontend Developer"
                />

              </div>


              <div class="form-group">

                <label for="interviewLocation">

                  Địa điểm phỏng vấn

                </label>

                <input
                  id="interviewLocation"
                  type="text"
                  placeholder="Ví dụ: Đà Nẵng"
                />

              </div>


              <div class="form-group">

                <label>

                  Hình thức phỏng vấn

                </label>

                <div class="radio-group">

                  <label>

                    <input
                      type="radio"
                      name="interviewType"
                      value="Trực tiếp"
                    />

                    Trực tiếp

                  </label>


                  <label>

                    <input
                      type="radio"
                      name="interviewType"
                      value="Online"
                    />

                    Online

                  </label>

                </div>

              </div>


              <div class="form-group">

                <label for="result">

                  Kết quả

                </label>

                <select id="result">

                  <option value="">
                    -- Chọn kết quả --
                  </option>

                  <option value="Đậu">
                    Đậu
                  </option>

                  <option value="Rớt">
                    Rớt
                  </option>

                  <option value="Đang chờ">
                    Đang chờ
                  </option>

                  <option value="Khác">
                    Khác
                  </option>

                </select>

              </div>

            </div>


            <div
              id="notInterviewSection"
              style="display:none;"
            >

              <div class="form-group">

                <label>

                  Bạn có đang tìm việc không?

                </label>

                <div class="radio-group">

                  <label>

                    <input
                      type="radio"
                      name="lookingForJob"
                      value="Có"
                    />

                    Có

                  </label>


                  <label>

                    <input
                      type="radio"
                      name="lookingForJob"
                      value="Không"
                    />

                    Không

                  </label>

                </div>

              </div>


              <div class="form-group">

                <label for="reason">

                  Lý do chưa phỏng vấn

                </label>

                <textarea
                  id="reason"
                  rows="4"
                  placeholder="Ví dụ: Chưa tìm được công việc phù hợp..."
                ></textarea>

              </div>

            </div>

          </section>


          <!-- ================================
               3. MONG MUỐN VIỆC LÀM
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                3. Mong muốn việc làm
              </h2>

              <p>
                Chia sẻ định hướng công việc của bạn
              </p>

            </div>


            <div class="form-group">

              <label for="jobWish">

                Bạn mong muốn công việc như thế nào?

              </label>

              <textarea
                id="jobWish"
                rows="5"
                placeholder="Ví dụ: Công việc IT, Tester, Developer, lương mong muốn, hình thức làm việc..."
              ></textarea>

            </div>

          </section>


          <!-- ================================
               4. VỊ TRÍ
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                4. Vị trí hiện tại
              </h2>

              <p>
                Lấy vị trí GPS của thiết bị
              </p>

            </div>


            <div class="location-box">

              <div
                id="locationStatus"
                class="location-status"
              >
                Chưa lấy vị trí
              </div>


              <button
                id="getLocationBtn"
                type="button"
                class="secondary-btn"
              >
                📍 Lấy vị trí hiện tại
              </button>

            </div>

          </section>


          <!-- ================================
               5. HÌNH ẢNH
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                5. Hình ảnh
              </h2>

              <p>
                Có thể đính kèm hình ảnh nếu cần
              </p>

            </div>


            <div class="image-section">

              <button
                id="takePhotoBtn"
                type="button"
                class="secondary-btn"
              >
                📷 Chụp ảnh
              </button>


              <button
                id="choosePhotoBtn"
                type="button"
                class="secondary-btn"
              >
                🖼️ Chọn ảnh
              </button>


              <div
                id="imagePreview"
                style="display:none;margin-top:16px;"
              >

                <img
                  id="previewImage"
                  src=""
                  alt="Ảnh khảo sát"
                  style="
                    max-width:100%;
                    max-height:300px;
                    border-radius:12px;
                    object-fit:contain;
                  "
                />

              </div>

            </div>

          </section>


          <!-- ================================
               SUBMIT
          ================================= -->

          <section class="form-card">

            <button
              id="submitBtn"
              type="submit"
              class="primary-btn"
            >
              📤 Gửi khảo sát
            </button>


            <button
              id="backHomeBtn"
              type="button"
              class="secondary-btn"
              style="margin-top:12px;"
            >
              ← Về trang chủ
            </button>

          </section>


        </form>

      </main>

    </div>

  `


  // ==========================================
  // INTERVIEW STATUS
  // ==========================================

  document
    .querySelectorAll(
      'input[name="interviewed"]'
    )
    .forEach(
      (radio) => {

        radio.addEventListener(
          'change',
          () => {

            const value =
              document.querySelector(
                'input[name="interviewed"]:checked'
              )?.value

            const interviewSection =
              document.querySelector(
                '#interviewSection'
              )

            const notInterviewSection =
              document.querySelector(
                '#notInterviewSection'
              )

            if (value === 'Có') {

              interviewSection.style.display =
                'block'

              notInterviewSection.style.display =
                'none'

            } else if (value === 'Chưa') {

              interviewSection.style.display =
                'none'

              notInterviewSection.style.display =
                'block'

            }

          }
        )

      }
    )


  // ==========================================
  // GPS
  // ==========================================

  const getLocationBtn =
    document.querySelector(
      '#getLocationBtn'
    )

  if (getLocationBtn) {

    getLocationBtn.addEventListener(
      'click',
      getCurrentLocation
    )
  }


  // ==========================================
  // CAMERA
  // ==========================================

  const takePhotoBtn =
    document.querySelector(
      '#takePhotoBtn'
    )

  if (takePhotoBtn) {

    takePhotoBtn.addEventListener(
      'click',
      takePhoto
    )
  }


  const choosePhotoBtn =
    document.querySelector(
      '#choosePhotoBtn'
    )

  if (choosePhotoBtn) {

    choosePhotoBtn.addEventListener(
      'click',
      choosePhoto
    )
  }


  // ==========================================
  // SUBMIT
  // ==========================================

  const form =
    document.querySelector(
      '#surveyForm'
    )

  if (form) {

    form.addEventListener(
      'submit',
      submitSurvey
    )
  }


  // ==========================================
  // BACK HOME
  // ==========================================

  const backHomeBtn =
    document.querySelector(
      '#backHomeBtn'
    )

  if (backHomeBtn) {

    backHomeBtn.addEventListener(
      'click',
      renderHome
    )
  }
}


// ==========================================
// COLLECT SURVEY DATA
// ==========================================

function collectSurveyData() {

  const gender =
    document.querySelector(
      'input[name="gender"]:checked'
    )?.value || ''


  const interviewed =
    document.querySelector(
      'input[name="interviewed"]:checked'
    )?.value || ''


  const interviewType =
    document.querySelector(
      'input[name="interviewType"]:checked'
    )?.value || ''


  const lookingForJob =
    document.querySelector(
      'input[name="lookingForJob"]:checked'
    )?.value || ''


  return {

    id:
      crypto.randomUUID(),


    fullName:
      document
        .querySelector('#fullName')
        .value
        .trim(),


    studentId:
      document
        .querySelector('#studentId')
        .value
        .trim(),


    major:
      document
        .querySelector('#major')
        .value,


    year:
      document
        .querySelector('#year')
        .value,


    gender,


    interviewed,


    interviewCount:
      document
        .querySelector('#interviewCount')
        .value || '',


    company:
      document
        .querySelector('#company')
        .value
        .trim(),


    position:
      document
        .querySelector('#position')
        .value
        .trim(),


    interviewLocation:
      document
        .querySelector('#interviewLocation')
        .value
        .trim(),


    interviewType,


    result:
      document
        .querySelector('#result')
        .value,


    lookingForJob,


    reason:
      document
        .querySelector('#reason')
        .value
        .trim(),


    jobWish:
      document
        .querySelector('#jobWish')
        .value
        .trim(),


    location:
      surveyData.location ||
      null,


    image:
      surveyData.image ||
      null,


    status:
      'PENDING_SYNC'

  }
}


// ==========================================
// GET LOCATION
// ==========================================

async function getCurrentLocation() {

  const status =
    document.querySelector(
      '#locationStatus'
    )

  const button =
    document.querySelector(
      '#getLocationBtn'
    )

  if (button) {

    button.disabled = true

    button.textContent =
      '⏳ Đang lấy vị trí...'
  }

  try {

    let position

    if (
      Capacitor.isNativePlatform()
    ) {

      const permission =
        await Geolocation
          .checkPermissions()

      if (
        permission.location !==
        'granted'
      ) {

        await Geolocation
          .requestPermissions()
      }

      position =
        await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000
        })

    } else {

      position =
        await new Promise(
          (resolve, reject) => {

            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            )

          }
        )
    }


    const latitude =
      position.coords.latitude

    const longitude =
      position.coords.longitude


    surveyData.location = {

      latitude,

      longitude

    }


    if (status) {

      status.innerHTML = `
        <div>
          <strong>Đã lấy vị trí</strong>
        </div>

        <div>
          Latitude:
          ${latitude}
        </div>

        <div>
          Longitude:
          ${longitude}
        </div>
      `
    }

    console.log(
      'GPS:',
      surveyData.location
    )

  } catch (error) {

    console.error(
      'Location Error:',
      error
    )

    if (status) {

      status.textContent =
        'Không thể lấy vị trí.'
    }

    alert(
      'Không thể lấy vị trí hiện tại.\n\n' +
      'Hãy kiểm tra quyền truy cập vị trí của trình duyệt hoặc thiết bị.'
    )

  } finally {

    if (button) {

      button.disabled = false

      button.textContent =
        '📍 Lấy vị trí hiện tại'
    }
  }
}


// ==========================================
// TAKE PHOTO
// ==========================================

async function takePhoto() {

  try {

    if (
      Capacitor.isNativePlatform()
    ) {

      const image =
        await Camera.getPhoto({

          quality: 80,

          allowEditing: false,

          resultType:
            CameraResultType.Base64,

          source:
            CameraSource.Camera

        })

      if (image.base64String) {

        surveyData.image =
          `data:image/${image.format};base64,${image.base64String}`

        showImagePreview(
          surveyData.image
        )
      }

    } else {

      await openFilePicker(
        true
      )
    }

  } catch (error) {

    console.error(
      'Camera Error:',
      error
    )

    alert(
      'Không thể chụp ảnh.'
    )
  }
}


// ==========================================
// CHOOSE PHOTO
// ==========================================

async function choosePhoto() {

  try {

    if (
      Capacitor.isNativePlatform()
    ) {

      const image =
        await Camera.getPhoto({

          quality: 80,

          allowEditing: false,

          resultType:
            CameraResultType.Base64,

          source:
            CameraSource.Photos

        })

      if (image.base64String) {

        surveyData.image =
          `data:image/${image.format};base64,${image.base64String}`

        showImagePreview(
          surveyData.image
        )
      }

    } else {

      await openFilePicker(
        false
      )
    }

  } catch (error) {

    console.error(
      'Choose Photo Error:',
      error
    )

    alert(
      'Không thể chọn ảnh.'
    )
  }
}


// ==========================================
// FILE PICKER WEB
// ==========================================

function openFilePicker(
  useCamera
) {

  return new Promise(
    (resolve, reject) => {

      const input =
        document.createElement(
          'input'
        )

      input.type =
        'file'

      input.accept =
        'image/*'

      if (useCamera) {

        input.setAttribute(
          'capture',
          'environment'
        )
      }

      input.onchange =
        () => {

          const file =
            input.files?.[0]

          if (!file) {

            resolve()

            return
          }

          const reader =
            new FileReader()

          reader.onload =
            () => {

              surveyData.image =
                reader.result

              showImagePreview(
                surveyData.image
              )

              resolve()
            }

          reader.onerror =
            () => {

              reject(
                reader.error
              )
            }

          reader.readAsDataURL(
            file
          )
        }

      input.click()
    }
  )
}


// ==========================================
// IMAGE PREVIEW
// ==========================================

function showImagePreview(
  image
) {

  const preview =
    document.querySelector(
      '#imagePreview'
    )

  const img =
    document.querySelector(
      '#previewImage'
    )

  if (!preview || !img) {
    return
  }

  img.src =
    image

  preview.style.display =
    'block'
}


// ==========================================
// TẠO OBJECT GỬI GOOGLE SHEET
// ==========================================

function prepareSurveyForSync(
  survey
) {

  return {

    id:
      survey.id,

    fullName:
      survey.fullName,

    studentId:
      survey.studentId,

    major:
      survey.major,

    year:
      survey.year,

    gender:
      survey.gender,

    interviewed:
      survey.interviewed,

    interviewCount:
      survey.interviewCount,

    company:
      survey.company,

    position:
      survey.position,

    interviewLocation:
      survey.interviewLocation,

    interviewType:
      survey.interviewType,

    result:
      survey.result,

    lookingForJob:
      survey.lookingForJob,

    reason:
      survey.reason,

    jobWish:
      survey.jobWish,

    location:
      survey.location ||
      null,

    image:
      survey.image ||
      null,

    status:
      'PENDING_SYNC'

  }
}


// ==========================================
// GỬI 1 KHẢO SÁT LÊN GOOGLE SHEET
// ==========================================

async function syncSurvey(
  survey
) {

  console.log(
    'Đang đồng bộ khảo sát:',
    survey.id
  )


  const payload =
    prepareSurveyForSync(
      survey
    )


  const response =
    await fetch(
      API_URL,
      {

        method: 'POST',

        headers: {

          'Content-Type':
            'text/plain;charset=utf-8'

        },

        body:
          JSON.stringify(
            payload
          )

      }
    )


  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    )
  }


  const result =
    await response.json()


  console.log(
    'Apps Script:',
    result
  )


  if (!result.success) {

    throw new Error(
      result.message ||
      'Google Sheet không nhận dữ liệu'
    )
  }


  survey.status =
    'SYNCED'


  await saveSurvey(
    survey
  )


  console.log(
    'Đồng bộ thành công:',
    survey.id
  )
}


// ==========================================
// ĐỒNG BỘ TẤT CẢ KHẢO SÁT ĐANG CHỜ
// ==========================================

async function syncPendingSurveys() {

  if (!navigator.onLine) {

    console.log(
      'Đang offline, chưa đồng bộ.'
    )

    return
  }


  try {

    const allSurveys =
      await getAllSurveys()


    const pendingSurveys =
      allSurveys.filter(
        (survey) =>
          survey.status !==
          'SYNCED'
      )


    console.log(
      `Có ${pendingSurveys.length} khảo sát đang chờ đồng bộ.`
    )


    if (
      pendingSurveys.length ===
      0
    ) {

      return
    }


    for (
      const survey
      of pendingSurveys
    ) {

      try {

        await syncSurvey(
          survey
        )

      } catch (error) {

        console.error(
          'Không thể đồng bộ khảo sát:',
          survey.id,
          error
        )

        break
      }
    }

  } catch (error) {

    console.error(
      'Lỗi lấy dữ liệu IndexedDB:',
      error
    )
  }
}


// ==========================================
// SUBMIT KHẢO SÁT
// ==========================================

async function submitSurvey(
  event
) {

  event.preventDefault()


  const form =
    document.querySelector(
      '#surveyForm'
    )


  if (!form.checkValidity()) {

    form.reportValidity()

    return
  }


  const submitButton =
    document.querySelector(
      '#submitBtn'
    )


  if (submitButton) {

    submitButton.disabled =
      true

    submitButton.textContent =
      '⏳ Đang lưu khảo sát...'
  }


  const survey =
    collectSurveyData()


  // ----------------------------------------
  // LƯU LOCAL TRƯỚC
  // ----------------------------------------

  try {

    await saveSurvey(
      survey
    )


    console.log(
      'Đã lưu khảo sát vào IndexedDB:',
      survey.id
    )

  } catch (error) {

    console.error(
      'Lỗi lưu IndexedDB:',
      error
    )


    alert(
      'Không thể lưu khảo sát trên thiết bị.'
    )

    if (submitButton) {

      submitButton.disabled =
        false

      submitButton.textContent =
        '📤 Gửi khảo sát'
    }

    return
  }


  // ----------------------------------------
  // OFFLINE
  // ----------------------------------------

  if (!navigator.onLine) {

    alert(
      'Đã lưu khảo sát offline. Khi có mạng, dữ liệu sẽ tự động đồng bộ.'
    )


    form.reset()


    surveyData = {}


    const interviewSection =
      document.querySelector(
        '#interviewSection'
      )

    if (interviewSection) {

      interviewSection.style.display =
        'none'
    }


    const notInterviewSection =
      document.querySelector(
        '#notInterviewSection'
      )

    if (notInterviewSection) {

      notInterviewSection.style.display =
        'none'
    }


    const locationStatus =
      document.querySelector(
        '#locationStatus'
      )

    if (locationStatus) {

      locationStatus.textContent =
        'Chưa lấy vị trí'
    }


    const imagePreview =
      document.querySelector(
        '#imagePreview'
      )

    if (imagePreview) {

      imagePreview.style.display =
        'none'
    }


    if (submitButton) {

      submitButton.disabled =
        false

      submitButton.textContent =
        '📤 Gửi khảo sát'
    }

    return
  }


  // ----------------------------------------
  // ONLINE
  // ----------------------------------------

  try {

    if (submitButton) {

      submitButton.textContent =
        '⏳ Đang đồng bộ...'
    }


    await syncSurvey(
      survey
    )


    alert(
      '✅ Khảo sát đã được gửi thành công!'
    )


    form.reset()


    surveyData = {}


    const interviewSection =
      document.querySelector(
        '#interviewSection'
      )

    if (interviewSection) {

      interviewSection.style.display =
        'none'
    }


    const notInterviewSection =
      document.querySelector(
        '#notInterviewSection'
      )

    if (notInterviewSection) {

      notInterviewSection.style.display =
        'none'
    }


    const locationStatus =
      document.querySelector(
        '#locationStatus'
      )

    if (locationStatus) {

      locationStatus.textContent =
        'Chưa lấy vị trí'
    }


    const imagePreview =
      document.querySelector(
        '#imagePreview'
      )

    if (imagePreview) {

      imagePreview.style.display =
        'none'
    }


    showSyncNotification()

  } catch (error) {

    console.error(
      'Lỗi đồng bộ:',
      error
    )


    alert(
      '⚠️ Không thể đồng bộ lúc này.\n\n' +
      'Dữ liệu đã được lưu trên thiết bị và sẽ tự động đồng bộ khi có mạng.'
    )

  } finally {

    if (submitButton) {

      submitButton.disabled =
        false

      submitButton.textContent =
        '📤 Gửi khảo sát'
    }
  }
}


// ==========================================
// CAPACITOR NETWORK
// ==========================================

async function initNativeNetwork() {

  if (
    !Capacitor.isNativePlatform()
  ) {

    return
  }


  try {

    const status =
      await Network.getStatus()


    updateNetworkUI(
      status.connected
    )


    await Network.addListener(
      'networkStatusChange',
      (status) => {

        updateNetworkUI(
          status.connected
        )


        if (
          status.connected
        ) {

          syncPendingSurveys()
            .catch(
              console.error
            )
        }

      }
    )

  } catch (error) {

    console.error(
      'Network plugin error:',
      error
    )
  }
}


// ==========================================
// UPDATE NETWORK UI
// ==========================================

function updateNetworkUI(
  connected
) {

  document
    .querySelectorAll(
      '.network-status'
    )
    .forEach(
      (status) => {

        status.className =
          `network-status ${
            connected
              ? 'online'
              : 'offline'
          }`

        status.textContent =
          connected
            ? '● Online'
            : '● Offline'

      }
    )
}


// ==========================================
// LOCAL NOTIFICATION
// ==========================================

async function showSyncNotification() {

  if (
    !Capacitor.isNativePlatform()
  ) {

    return
  }


  try {

    let permission =
      await LocalNotifications
        .checkPermissions()


    if (
      permission.display !==
      'granted'
    ) {

      permission =
        await LocalNotifications
          .requestPermissions()
    }


    if (
      permission.display !==
      'granted'
    ) {

      return
    }


    await LocalNotifications.schedule({

      notifications: [

        {

          id:
            Math.floor(
              Date.now() / 1000
            ),

          title:
            'VKU Interview Survey',

          body:
            'Khảo sát đã được đồng bộ thành công.',

          schedule: {

            at:
              new Date(
                Date.now() + 1000
              )

          }

        }

      ]

    })

  } catch (error) {

    console.error(
      'Local notification error:',
      error
    )
  }
}


// ==========================================
// ONLINE EVENT
// ==========================================

window.addEventListener(
  'online',
  () => {

    console.log(
      '🌐 Đã có mạng trở lại.'
    )

    updateNetworkUI(
      true
    )

    syncPendingSurveys()
      .catch(
        console.error
      )
  }
)


window.addEventListener(
  'offline',
  () => {

    console.log(
      '📴 Thiết bị đang offline.'
    )

    updateNetworkUI(
      false
    )
  }
)


// ==========================================
// SERVICE WORKER
// ==========================================

if (
  'serviceWorker' in navigator &&
  location.hostname !==
    'localhost' &&
  location.hostname !==
    '127.0.0.1'
) {

  window.addEventListener(
    'load',
    () => {

      navigator.serviceWorker
        .register(
          '/sw.js'
        )
        .then(
          (registration) => {

            console.log(
              'Service Worker registered:',
              registration.scope
            )

          }
        )
        .catch(
          (error) => {

            console.error(
              'Service Worker error:',
              error
            )

          }
        )

    }
  )
}


// ==========================================
// KHỞI TẠO APP
// ==========================================

window.addEventListener(
  'load',
  () => {

    initNativeNetwork()
      .catch(
        console.error
      )


    syncPendingSurveys()
      .catch(
        console.error
      )

  }
)