import { useState } from 'react';
import { 
  Heart, 
  Pill, 
  TrendingUp, 
  Calendar,
  Activity,
  Plus,
  User,
  Clock
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  Button, 
  Card, 
  StatCard, 
  Badge, 
  Modal,
  Loader 
} from '../../components/ui';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const todayStats = {
    medicinesTaken: 3,
    totalMedicines: 5,
    adherenceRate: 85,
    streakDays: 12
  };

  const todayMedicines = [
    { id: 1, name: 'Vitamin D', time: '08:00 AM', taken: true, type: 'vitamin' },
    { id: 2, name: 'Blood Pressure', time: '12:00 PM', taken: true, type: 'prescription' },
    { id: 3, name: 'Omega-3', time: '02:00 PM', taken: true, type: 'supplement' },
    { id: 4, name: 'Calcium', time: '06:00 PM', taken: false, type: 'supplement' },
    { id: 5, name: 'Melatonin', time: '10:00 PM', taken: false, type: 'supplement' }
  ];

  const recentActivities = [
    { id: 1, action: 'Took Vitamin D', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Missed Calcium dose', time: '5 hours ago', type: 'warning' },
    { id: 3, action: 'Added new prescription', time: '1 day ago', type: 'info' },
    { id: 4, action: 'Updated profile', time: '3 days ago', type: 'info' }
  ];

  const handleTakeMedicine = (id) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Medicine ${id} taken`);
    }, 1000);
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Good morning, John! 👋
                </h2>
                <p className="text-slate-300">
                  You have {todayStats.totalMedicines - todayStats.medicinesTaken} medicines left to take today
                </p>
              </div>
              <div className="hidden md:block">
                <StatCard.Progress
                  title="Today's Progress"
                  value={todayStats.medicinesTaken}
                  unit={`/ ${todayStats.totalMedicines}`}
                  progress={Math.round((todayStats.medicinesTaken / todayStats.totalMedicines) * 100)}
                  progressColor="teal"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10" />
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Adherence Rate"
            value={todayStats.adherenceRate}
            unit="%"
            progress={todayStats.adherenceRate}
            progressColor="green"
            variant="teal"
          />
          
          <StatCard
            title="Streak Days"
            value={todayStats.streakDays}
            unit="days"
            icon={<TrendingUp size={20} />}
            trend="up"
            trendValue="+2 from last week"
            variant="violet"
          />
          
          <StatCard
            title="This Month"
            value="94"
            unit="%"
            subtitle="Medicine adherence"
            icon={<Heart size={20} />}
            variant="glass"
          />
          
          <StatCard
            title="Total Medicines"
            value={todayStats.totalMedicines}
            subtitle="Active prescriptions"
            icon={<Pill size={20} />}
            variant="outline"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Medicines */}
          <Card variant="default" className="lg:col-span-2">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="flex items-center gap-2">
                  <Clock size={20} className="text-teal-400" />
                  Today's Medicines
                </Card.Title>
                <Badge variant="primary" size="sm">
                  {todayStats.medicinesTaken}/{todayStats.totalMedicines} taken
                </Badge>
              </div>
            </Card.Header>
            
            <Card.Content>
              <div className="space-y-3">
                {todayMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        medicine.taken ? 'bg-green-400' : 'bg-slate-600'
                      }`} />
                      <div>
                        <h4 className="font-medium text-white">{medicine.name}</h4>
                        <p className="text-sm text-slate-400">{medicine.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          medicine.type === 'prescription' ? 'primary' :
                          medicine.type === 'vitamin' ? 'success' : 'outline'
                        }
                        size="sm"
                      >
                        {medicine.type}
                      </Badge>
                      
                      {!medicine.taken && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => handleTakeMedicine(medicine.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader variant="dots" size="sm" /> : 'Take'}
                        </Button>
                      )}
                      
                      {medicine.taken && (
                        <Badge variant="success" dot size="sm">
                          Taken
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
            
            <Card.Footer>
              <Button
                variant="outline"
                width="full"
                leftIcon={<Plus size={18} />}
                onClick={() => setShowModal(true)}
              >
                Add New Medicine
              </Button>
            </Card.Footer>
          </Card>

          {/* Recent Activity */}
          <Card variant="glass">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Activity size={20} className="text-violet-400" />
                Recent Activity
              </Card.Title>
            </Card.Header>
            
            <Card.Content>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="solid">
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>
              Frequently used features for easy access
            </Card.Description>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="teal" className="h-16 flex-col gap-2">
                <Pill size={20} />
                <span className="text-sm">Add Medicine</span>
              </Button>
              
              <Button variant="violet" className="h-16 flex-col gap-2">
                <Calendar size={20} />
                <span className="text-sm">Schedule</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Heart size={20} />
                <span className="text-sm">Vital Signs</span>
              </Button>
              
              <Button variant="ghost" className="h-16 flex-col gap-2">
                <User size={20} />
                <span className="text-sm">Profile</span>
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Medicine"
        description="Enter the details for your new medicine"
        size="lg"
      >
        <Modal.Content>
          <div className="space-y-4">
            <p className="text-slate-300">
              This is a demo modal showcasing the responsive modal component. 
              It works perfectly on both desktop and mobile devices with proper 
              backdrop blur and animations.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="success">Responsive</Badge>
              <Badge variant="primary">Animated</Badge>
              <Badge variant="violet">Accessible</Badge>
            </div>
          </div>
        </Modal.Content>
        
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={() => setShowModal(false)}>
            Save Medicine
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;