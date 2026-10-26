package com.example.TeamManger.repository;

import com.example.TeamManger.entity.CommunicationLog;
import com.example.TeamManger.entity.ChannelType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {
    List<CommunicationLog> findByChannelTypeOrderByTimestampAsc(ChannelType channelType);
    List<CommunicationLog> findByChannelTypeAndTeamIdOrderByTimestampAsc(ChannelType channelType, Long teamId);
    List<CommunicationLog> findByChannelTypeAndTaskIdOrderByTimestampAsc(ChannelType channelType, Long taskId);
}
