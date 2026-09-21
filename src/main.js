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
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth'

import { auth } from './firebase.js'


// ==========================================
// FIREBASE GOOGLE LOGIN
// ==========================================

const googleProvider =
  new GoogleAuthProvider()

let currentUser = null


function renderLogin() {

  app.innerHTML = `

    <div
      style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        background:#f1f5f9;
        box-sizing:border-box;
      "
    >

      <div
        style="
          width:min(420px,100%);
          background:white;
          border-radius:20px;
          padding:32px;
          box-shadow:0 12px 35px rgba(15,23,42,.12);
          text-align:center;
        "
      >

        <div style="font-size:48px;">
          🎓
        </div>

        <h1>
          VKU Interview Survey
        </h1>

        <p
          style="
            color:#64748b;
            line-height:1.6;
          "
        >
          Đăng nhập bằng Google để thực hiện khảo sát.
        </p>

      <button
        id="googleLoginBtn"
        class="primary-btn google-login-btn"
        style="
          width:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:12px;
        "
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          style="
            width:20px;
            height:20px;
          "
        />

        <span>
          Đăng nhập bằng Google
        </span>
      </button>

      </div>

    </div>

  `

  document
    .querySelector('#googleLoginBtn')
    .addEventListener(
      'click',
      loginWithGoogle
    )
}


async function loginWithGoogle() {

  const button =
    document.querySelector(
      '#googleLoginBtn'
    )

  try {

    button.disabled = true

    button.textContent =
      '⏳ Đang đăng nhập...'

    await signInWithPopup(
      auth,
      googleProvider
    )

  } catch (error) {

    console.error(
      'Google Login Error:',
      error
    )

    alert(
      'Đăng nhập Google thất bại. Hãy kiểm tra cấu hình Firebase.'
    )

    if (button) {

      button.disabled = false

      button.textContent =
        '🔐 Đăng nhập bằng Google'
    }
  }
}


async function logout() {

  try {

    await signOut(auth)

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


const app =
  document.querySelector(
    '#app'
  )


// Dữ liệu tạm của form
let surveyData = {}


// ==========================================
// FIREBASE AUTH STATE
// ==========================================

onAuthStateChanged(
  auth,
  (user) => {

    currentUser = user

    if (!user) {

      renderLogin()

      return
    }

    renderHome()

    syncPendingSurveys()
      .catch(
        (error) => {

          console.error(
            'Lỗi đồng bộ khi khởi động:',
            error
          )
        }
      )
  }
)


// ==========================================
// LẤY THỐNG KÊ
// ==========================================

async function getStatistics() {

  try {

    const response =
      await fetch(API_URL, {
        method: 'GET',
        cache: 'no-store'
      })


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


    // Không giả vờ rằng dữ liệu bị mất.
    // Giữ trạng thái lỗi để kiểm tra API.
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
                Thông tin về quá trình tìm việc của bạn
              </p>

            </div>


            <div class="form-group">

              <label>

                Bạn đã từng tham gia
                phỏng vấn xin việc chưa?

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

                  Đã từng

                </label>


                <label>

                  <input
                    type="radio"
                    name="interviewed"
                    value="Chưa"
                  />

                  Chưa

                </label>

              </div>

            </div>

          </section>


          <!-- ================================
               3. ĐÃ PHỎNG VẤN
          ================================= -->

          <section
            class="form-card"
            id="interviewSection"
            style="display:none;"
          >

            <div class="form-title">

              <h2>
                3. Thông tin phỏng vấn
              </h2>

              <p>
                Thông tin về quá trình phỏng vấn
              </p>

            </div>


            <div class="form-group">

              <label for="interviewCount">
                Số lần đã phỏng vấn
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
                Công ty đã phỏng vấn
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
                placeholder="Ví dụ: Tester, Developer..."
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

          </section>


          <!-- ================================
               3. CHƯA PHỎNG VẤN
          ================================= -->

          <section
            class="form-card"
            id="notInterviewSection"
            style="display:none;"
          >

            <div class="form-title">

              <h2>
                3. Nhu cầu việc làm
              </h2>

              <p>
                Hãy cho chúng tôi biết thêm về nhu cầu của bạn
              </p>

            </div>


            <div class="form-group">

              <label>
                Bạn có đang tìm kiếm việc làm không?
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
                Lý do chưa tham gia phỏng vấn
              </label>

              <textarea
                id="reason"
                rows="4"
                placeholder="Nhập lý do..."
              ></textarea>

            </div>

          </section>


          <!-- ================================
               4. MONG MUỐN VIỆC LÀM
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                4. Mong muốn việc làm
              </h2>

              <p>
                Chia sẻ công việc bạn đang hướng đến
              </p>

            </div>


            <div class="form-group">

              <label for="jobWish">

                Bạn mong muốn công việc như thế nào?

              </label>

              <textarea
                id="jobWish"
                rows="5"
                placeholder="Ví dụ: Tester, QA, Developer..."
              ></textarea>

            </div>

          </section>


          <!-- ================================
               5. LOCATION
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                5. Thông tin vị trí
              </h2>

              <p>
                Có thể lấy vị trí hiện tại của bạn
              </p>

            </div>


            <div class="location-row">

              <button
                type="button"
                id="locationBtn"
                class="secondary-btn"
              >
                📍 Lấy location
              </button>


              <span id="locationStatus">
                Chưa lấy vị trí
              </span>

            </div>

          </section>


          <!-- ================================
               6. ẢNH
          ================================= -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                6. Ảnh
              </h2>

              <p>
                Không bắt buộc
              </p>

            </div>


            <div class="form-group">

              <button
                type="button"
                id="cameraBtn"
                class="secondary-btn"
              >
                📷 Chụp ảnh
              </button>


              <input
                id="image"
                type="file"
                accept="image/*"
                capture="environment"
                style="margin-top:10px;"
              />


              <small>

                Có thể chụp ảnh hoặc
                chọn ảnh từ thiết bị.

              </small>


              <div id="imagePreview"></div>

            </div>

          </section>


          <!-- ================================
               SUBMIT
          ================================= -->

          <div class="form-actions">

            <button
              type="submit"
              class="primary-btn"
            >

              💾 Gửi khảo sát

            </button>

          </div>


        </form>

      </main>

    </div>

  `


  setupSurveyEvents()
}


// ==========================================
// SETUP EVENTS
// ==========================================

function setupSurveyEvents() {


  document
    .querySelectorAll(
      'input[name="interviewed"]'
    )
    .forEach(
      (radio) => {

        radio.addEventListener(
          'change',
          updateInterviewSection
        )

      }
    )


  document
    .querySelector('#locationBtn')
    .addEventListener(
      'click',
      getLocation
    )


  document
    .querySelector('#cameraBtn')
    .addEventListener(
      'click',
      takePhoto
    )


  document
    .querySelector('#image')
    .addEventListener(
      'change',
      handleImage
    )


  document
    .querySelector('#surveyForm')
    .addEventListener(
      'submit',
      submitSurvey
    )
}


// ==========================================
// HIỂN THỊ PHẦN PHỎNG VẤN
// ==========================================

function updateInterviewSection() {

  const selected =
    document.querySelector(
      'input[name="interviewed"]:checked'
    )


  if (!selected) {
    return
  }


  const interviewSection =
    document.querySelector(
      '#interviewSection'
    )


  const notInterviewSection =
    document.querySelector(
      '#notInterviewSection'
    )


  if (
    selected.value === 'Có'
  ) {

    interviewSection.style.display =
      'block'

    notInterviewSection.style.display =
      'none'

  } else {

    interviewSection.style.display =
      'none'

    notInterviewSection.style.display =
      'block'
  }
}


// ==========================================
// GPS - CAPACITOR / WEB
// ==========================================

async function getLocation() {

  const button =
    document.querySelector(
      '#locationBtn'
    )

  const status =
    document.querySelector(
      '#locationStatus'
    )


  button.disabled = true

  button.textContent =
    '📍 Đang lấy vị trí...'


  try {

    let position


    // Android / Capacitor
    if (
      Capacitor.isNativePlatform()
    ) {

      await Geolocation.requestPermissions()

      position =
        await Geolocation.getCurrentPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000
          }
        )

    }

    // Web / PWA
    else {

      if (!navigator.geolocation) {

        throw new Error(
          'Thiết bị không hỗ trợ GPS.'
        )
      }


      position =
        await new Promise(
          (resolve, reject) => {

            navigator.geolocation
              .getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              )

          }
        )
    }


    surveyData.location = {

      latitude:
        position.coords.latitude,

      longitude:
        position.coords.longitude

    }


    status.textContent =
      `Đã lấy: ${
        position.coords.latitude.toFixed(6)
      }, ${
        position.coords.longitude.toFixed(6)
      }`


    button.textContent =
      '📍 Lấy lại location'


  } catch (error) {

    console.error(
      'GPS error:',
      error
    )


    alert(
      'Không thể lấy vị trí. Hãy kiểm tra quyền truy cập vị trí.'
    )


    button.textContent =
      '📍 Lấy location'

  } finally {

    button.disabled = false

  }
}


// ==========================================
// CAMERA - CAPACITOR
// ==========================================

async function takePhoto() {

  if (
    !Capacitor.isNativePlatform()
  ) {

    alert(
      'Trên trình duyệt, hãy sử dụng nút chọn ảnh bên dưới.'
    )

    return
  }


  try {

    const permission =
      await Camera.checkPermissions()


    if (
      permission.camera !== 'granted'
    ) {

      await Camera.requestPermissions()
    }


    const photo =
      await Camera.getPhoto({

        quality: 70,

        resultType:
          CameraResultType.DataUrl,

        source:
          CameraSource.Prompt

      })


    if (
      !photo.dataUrl
    ) {

      return
    }


    surveyData.image =
      photo.dataUrl


    const preview =
      document.querySelector(
        '#imagePreview'
      )


    preview.innerHTML = `

      <img
        src="${photo.dataUrl}"
        class="survey-image-preview"
        alt="Ảnh khảo sát"
      />

    `

  } catch (error) {

    console.error(
      'Camera error:',
      error
    )

    alert(
      'Không thể mở camera.'
    )
  }
}


// ==========================================
// ẢNH WEB
// ==========================================

function handleImage(event) {

  const file =
    event?.target?.files?.[0]


  if (!file) {
    return
  }


  const reader =
    new FileReader()


  reader.onload =
    () => {

      surveyData.image =
        reader.result


      const preview =
        document.querySelector(
          '#imagePreview'
        )


      preview.innerHTML = `

        <img
          src="${reader.result}"
          class="survey-image-preview"
          alt="Ảnh khảo sát"
        />

      `
    }


  reader.readAsDataURL(
    file
  )
}


// ==========================================
// TẠO DATA KHẢO SÁT
// ==========================================

function collectSurveyData() {


  const interviewed =
    document.querySelector(
      'input[name="interviewed"]:checked'
    )?.value || ''


  const gender =
    document.querySelector(
      'input[name="gender"]:checked'
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
// GỬI 1 KHẢO SÁT LÊN GOOGLE SHEET
// ==========================================

async function syncSurvey(
  survey
) {

  console.log(
    'Đang đồng bộ khảo sát:',
    survey.id
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
            survey
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


  await showSyncNotification()
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
      pendingSurveys.length === 0
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
// RESET FORM
// ==========================================

function resetSurveyForm() {

  const form =
    document.querySelector(
      '#surveyForm'
    )


  if (form) {
    form.reset()
  }


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

    imagePreview.innerHTML =
      ''
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


  if (
    !form.checkValidity()
  ) {

    form.reportValidity()

    return
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


    return
  }


  // ----------------------------------------
  // OFFLINE
  // ----------------------------------------

  if (
    !navigator.onLine
  ) {

    alert(
      'Đã lưu khảo sát offline. Khi có mạng, dữ liệu sẽ tự động đồng bộ.'
    )


    resetSurveyForm()

    return
  }


  // ----------------------------------------
  // ONLINE
  // ----------------------------------------

  try {

    await syncSurvey(
      survey
    )


    alert(
      'Gửi khảo sát thành công!'
    )


    resetSurveyForm()


  } catch (error) {

    console.error(
      'Lỗi đồng bộ:',
      error
    )


    alert(
      'Đã lưu khảo sát trên thiết bị nhưng chưa đồng bộ được. Hệ thống sẽ tự động thử lại khi có mạng.'
    )
  }
}


// ==========================================
// KHI CÓ MẠNG TRỞ LẠI
// ==========================================

window.addEventListener(
  'online',
  async () => {

    console.log(
      'Đã có kết nối mạng trở lại.'
    )


    const status =
      document.querySelector(
        '.network-status'
      )


    if (status) {

      status.className =
        'network-status online'

      status.textContent =
        '● Online'
    }


    await syncPendingSurveys()
  }
)


// ==========================================
// KHI MẤT MẠNG
// ==========================================

window.addEventListener(
  'offline',
  () => {

    console.log(
      'Thiết bị đang offline.'
    )


    const status =
      document.querySelector(
        '.network-status'
      )


    if (status) {

      status.className =
        'network-status offline'

      status.textContent =
        '● Offline'
    }
  }
)


// ==========================================
// KHỞI ĐỘNG APP
// ==========================================

initNativeNetwork()


// ==========================================
// SERVICE WORKER
// ==========================================

// Không đăng ký Service Worker ở localhost.
// Điều này giúp Vite cập nhật code ngay khi đang phát triển.

if (
  'serviceWorker' in navigator &&
  window.location.hostname !== 'localhost'
) {

  window.addEventListener(
    'load',
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            '/sw.js'
          )


        console.log(
          '[PWA] Service Worker registered:',
          registration.scope
        )


      } catch (error) {

        console.error(
          '[PWA] Service Worker registration failed:',
          error
        )
      }
    }
  )
}