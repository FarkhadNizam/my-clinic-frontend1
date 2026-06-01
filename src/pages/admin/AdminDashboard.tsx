import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';

export function AdminDashboard() {
  return (
      <PageWrapper title="Панель администратора">
        <p className="mb-12 text-gray-600 text-center max-w-2xl mx-auto px-4">
          Добро пожаловать в админ-панель! Здесь вы можете управлять врачами и расписаниями.
        </p>

        <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4">
          <Link to="/admin/create-doctor" className="transform transition duration-300 hover:scale-105">
            <Card>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div
                  className="
                    flex items-center justify-center 
                    w-16 h-16 rounded-full 
                    bg-gradient-to-r from-blue-400 to-blue-600 
                    text-white text-3xl
                    shadow-md
                  "
                >
                  🩺
                </div>
                <h2 className="text-center text-blue-700 font-bold text-xl">Создать врача</h2>
                <p className="text-center text-gray-500 text-sm max-w-xs">
                  Добавьте нового врача в систему для назначения расписаний и пациентов.
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/admin/create-schedule" className="transform transition duration-300 hover:scale-105">
            <Card>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div
                  className="
                    flex items-center justify-center 
                    w-16 h-16 rounded-full 
                    bg-gradient-to-r from-green-400 to-green-600 
                    text-white text-3xl
                    shadow-md
                  "
                >
                  📅
                </div>
                <h2 className="text-center text-green-700 font-bold text-xl">Создать расписание</h2>
                <p className="text-center text-gray-500 text-sm max-w-xs">
                  Организуйте рабочее время врачей, создавая расписания.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </PageWrapper>
  );
}
