// pages/registrar/RegistrarDashboard.tsx
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { CalendarDaysIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export function RegistrarDashboard() {
  return (
      <PageWrapper title="Панель регистратора">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Link to="/registrar/create-patient" className="group">
            <Card className="hover:bg-blue-50 transition-colors h-full">
              <div className="flex flex-col items-center p-6">
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <UserPlusIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Новый пациент</h3>
                <p className="text-sm text-gray-500 text-center">
                  Регистрация нового пациента в системе
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/registrar/schedule" className="group">
            <Card className="hover:bg-green-50 transition-colors h-full">
              <div className="flex flex-col items-center p-6">
                <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                  <CalendarDaysIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Запись на приём</h3>
                <p className="text-sm text-gray-500 text-center">
                  Запись пациента к врачу
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </PageWrapper>
  );
}