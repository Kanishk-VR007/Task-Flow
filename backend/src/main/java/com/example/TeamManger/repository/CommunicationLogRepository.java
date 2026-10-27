package com.example.TeamManger.repository;

import com.example.TeamManger.entity.CommunicationLog;
import com.example.TeamManger.entity.ChannelType;
import com.example.TeamManger.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {
    List<CommunicationLog> findByChannelTypeOrderByTimestampAsc(ChannelType channelType);
    List<CommunicationLog> findByChannelTypeAndTeamIdOrderByTimestampAsc(ChannelType channelType, Long teamId);
    List<CommunicationLog> findByChannelTypeAndTaskIdOrderByTimestampAsc(ChannelType channelType, Long taskId);

    List<CommunicationLog> findByChannelTypeAndCompanyOrderByTimestampAsc(ChannelType channelType, Users company);
    List<CommunicationLog> findByChannelTypeAndCompanyIdOrderByTimestampAsc(ChannelType channelType, Long companyId);
    List<CommunicationLog> findByChannelTypeAndTeamIdAndCompanyIdOrderByTimestampAsc(ChannelType channelType, Long teamId, Long companyId);
    List<CommunicationLog> findByChannelTypeAndTaskIdAndCompanyIdOrderByTimestampAsc(ChannelType channelType, Long taskId, Long companyId);
}
