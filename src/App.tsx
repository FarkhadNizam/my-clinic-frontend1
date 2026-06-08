import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateDoctor } from './pages/admin/CreateDoctor';
import { CreateSchedule } from './pages/admin/CreateSchedule';
import { RegistrarDashboard } from './pages/registrar/RegistrarDashboard';
import { CreatePatient } from './pages/registrar/CreatePatient';
import { SchedulePatient } from './pages/registrar/SchedulePatient';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AppointmentPage } from './pages/doctor/AppointmentPage';
import { LoginPage } from './pages/LoginPage';
import {Layout} from './components/ui/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppRoutes() {
  const { userRole } = useAuth();

  return (
    <>
    <Routes>
      {!userRole ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={
          <Layout>
            <Outlet /> {/* Это ключевое изменение */}
          </Layout>
        }>
          {userRole === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-doctor" element={<CreateDoctor />} />
              <Route path="/admin/create-schedule" element={<CreateSchedule />} />
            </>
          )}
          {userRole === 'registrar' && (
            <>
              <Route path="/registrar" element={<RegistrarDashboard />} />
              <Route path="/registrar/create-patient" element={<CreatePatient />} />
              <Route path="/registrar/schedule" element={<SchedulePatient />} />
            </>
          )}
          {userRole === 'doctor' && (
            <>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointment/:visitId/:patientId" element={<AppointmentPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to={`/${userRole}`} replace />} />
        </Route>
      )}
    </Routes>
    <ToastContainer position="top-right" autoClose={5000} />
    </>    
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}