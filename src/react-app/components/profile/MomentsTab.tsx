import { useState } from 'react';
import { Calendar, MapPin, Users, Award, Ticket, CheckCircle2, Plus } from 'lucide-react';
import { EventMomentType } from '@/shared/types';

interface MomentsTabProps {
  moments: EventMomentType[];
  isPublic?: boolean;
}

export default function MomentsTab({ moments, isPublic = false }: MomentsTabProps) {
  const [subTab, setSubTab] = useState<'all' | 'hosted' | 'attended'>('all');

  const filteredMoments = moments.filter((m) => {
    if (subTab === 'hosted') return m.is_hosted;
    if (subTab === 'attended') return m.is_attended;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab Filter */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setSubTab('all')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'all' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Moments ({moments.length})
        </button>
        <button
          onClick={() => setSubTab('hosted')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'hosted' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hosted ({moments.filter((m) => m.is_hosted).length})
        </button>
        <button
          onClick={() => setSubTab('attended')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'attended' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Attended ({moments.filter((m) => m.is_attended).length})
        </button>
      </div>

      {filteredMoments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-gray-900">No Event Moments</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            Attend or host live moments, drop launches, or meetups to collect verified event badges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMoments.map((moment) => (
            <div key={moment.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 transition-all">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  moment.is_hosted ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {moment.is_hosted ? 'Host' : 'Attendee'}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {moment.event_date}
                </span>
              </div>

              <h5 className="font-bold text-gray-900 text-base mt-3">{moment.title}</h5>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{moment.description}</p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {moment.location}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {moment.attendees_count} Joined
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
